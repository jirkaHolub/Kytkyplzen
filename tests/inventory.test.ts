import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import type { Db } from "@/db";
import {
  OutOfStockError,
  commitReservation,
  expireReservations,
  releaseReservation,
  reserveStock,
} from "@/modules/inventory/reservations";

let db: Db;
let storeId: string;
let productId: string;

beforeAll(async () => {
  const client = new PGlite();
  const d = drizzle(client, { schema });
  await migrate(d, { migrationsFolder: "./drizzle" });
  db = d as unknown as Db;
  const [s] = await db
    .insert(schema.stores)
    .values({ slug: "test", name: "Testovací prodejna", shortName: "Test", addressLine: "Ulice 1" })
    .returning();
  storeId = s.id;
  const [p] = await db
    .insert(schema.products)
    .values({ type: "ready_bouquet", name: "Kytice", slug: "kytice", priceCents: 50000, status: "published", storeId })
    .returning();
  productId = p.id;
});

beforeEach(async () => {
  await db.delete(schema.stockReservations);
  await db.delete(schema.stockMovements);
  await db.delete(schema.stock);
  await db.insert(schema.stock).values({ productId, storeId, qtyOnHand: 1, qtyReserved: 0 });
});

async function stockRow() {
  const [r] = await db
    .select()
    .from(schema.stock)
    .where(and(eq(schema.stock.productId, productId), eq(schema.stock.storeId, storeId)));
  return r;
}

describe("rezervace skladu", () => {
  it("rezervuje poslední kus a zvýší rezervované množství", async () => {
    const r = await reserveStock(db, { orderRef: "A", items: [{ productId, storeId, qty: 1 }] });
    expect(r.reservationIds).toHaveLength(1);
    const row = await stockRow();
    expect(row.qtyOnHand).toBe(1);
    expect(row.qtyReserved).toBe(1);
  });

  it("dva souběžné pokusy o poslední kus: uspěje právě jeden", async () => {
    const results = await Promise.allSettled([
      reserveStock(db, { orderRef: "A", items: [{ productId, storeId, qty: 1 }] }),
      reserveStock(db, { orderRef: "B", items: [{ productId, storeId, qty: 1 }] }),
    ]);
    const ok = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");
    expect(ok).toHaveLength(1);
    expect(failed).toHaveLength(1);
    expect((failed[0] as PromiseRejectedResult).reason).toBeInstanceOf(OutOfStockError);
    const row = await stockRow();
    expect(row.qtyReserved).toBe(1);
  });

  it("odmítne množství větší než volné a nic nezmění", async () => {
    await expect(
      reserveStock(db, { orderRef: "A", items: [{ productId, storeId, qty: 2 }] }),
    ).rejects.toBeInstanceOf(OutOfStockError);
    const row = await stockRow();
    expect(row.qtyReserved).toBe(0);
  });

  it("potvrzení rezervace odepíše sklad a zapíše pohyb", async () => {
    await reserveStock(db, { orderRef: "A", items: [{ productId, storeId, qty: 1 }] });
    const n = await commitReservation(db, "A");
    expect(n).toBe(1);
    const row = await stockRow();
    expect(row.qtyOnHand).toBe(0);
    expect(row.qtyReserved).toBe(0);
    const moves = await db.select().from(schema.stockMovements);
    expect(moves).toHaveLength(1);
    expect(moves[0].delta).toBe(-1);
    expect(moves[0].reason).toBe("order");
  });

  it("uvolnění rezervace vrátí kus do prodeje", async () => {
    await reserveStock(db, { orderRef: "A", items: [{ productId, storeId, qty: 1 }] });
    await releaseReservation(db, "A");
    const row = await stockRow();
    expect(row.qtyReserved).toBe(0);
    const again = await reserveStock(db, { orderRef: "B", items: [{ productId, storeId, qty: 1 }] });
    expect(again.reservationIds).toHaveLength(1);
  });

  it("propadlá rezervace se uvolní při další rezervaci", async () => {
    const t0 = new Date("2026-11-19T10:00:00Z");
    await reserveStock(db, { orderRef: "A", items: [{ productId, storeId, qty: 1 }], ttlMinutes: 15, now: t0 });
    const t1 = new Date("2026-11-19T10:10:00Z");
    await expect(
      reserveStock(db, { orderRef: "B", items: [{ productId, storeId, qty: 1 }], now: t1 }),
    ).rejects.toBeInstanceOf(OutOfStockError);
    const t2 = new Date("2026-11-19T10:16:00Z");
    const r = await reserveStock(db, { orderRef: "C", items: [{ productId, storeId, qty: 1 }], now: t2 });
    expect(r.reservationIds).toHaveLength(1);
    const released = await db
      .select()
      .from(schema.stockReservations)
      .where(eq(schema.stockReservations.orderRef, "A"));
    expect(released[0].state).toBe("released");
  });

  it("expireReservations vrací počet uvolněných", async () => {
    const t0 = new Date("2026-11-19T10:00:00Z");
    await reserveStock(db, { orderRef: "A", items: [{ productId, storeId, qty: 1 }], ttlMinutes: 1, now: t0 });
    expect(await expireReservations(db, new Date("2026-11-19T10:00:30Z"))).toBe(0);
    expect(await expireReservations(db, new Date("2026-11-19T10:02:00Z"))).toBe(1);
  });
});
