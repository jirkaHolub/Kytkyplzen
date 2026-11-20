import { and, eq, lt, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { stock, stockMovements, stockReservations } from "@/db/schema";

export type ReservationItem = { productId: string; storeId: string; qty: number };

export class OutOfStockError extends Error {
  constructor(
    public readonly productId: string,
    public readonly storeId: string,
    public readonly available: number,
    public readonly requested: number,
  ) {
    super(`Nedostatek skladu: produkt ${productId}, požadováno ${requested}, k dispozici ${available}`);
    this.name = "OutOfStockError";
  }
}

/**
 * Rezervuje zboží při zahájení platby. Běží v jedné transakci a řádky skladu zamyká
 * (SELECT ... FOR UPDATE), takže dva souběžné pokusy o poslední kus nemohou uspět oba.
 * Před rezervací uvolní propadlé rezervace, aby se sklad "sám" čistil i bez cronu.
 */
export async function reserveStock(
  db: Db,
  params: { orderRef: string; items: ReservationItem[]; ttlMinutes?: number; now?: Date },
): Promise<{ reservationIds: string[]; expiresAt: Date }> {
  const now = params.now ?? new Date();
  const ttl = params.ttlMinutes ?? 15;
  const expiresAt = new Date(now.getTime() + ttl * 60_000);
  if (params.items.length === 0) throw new Error("Prázdná rezervace");
  for (const it of params.items) {
    if (!Number.isInteger(it.qty) || it.qty <= 0) throw new Error("Neplatné množství");
  }

  await expireReservations(db, now);

  return db.transaction(async (tx) => {
    const ids: string[] = [];
    // stabilní pořadí zámků, aby nevznikl deadlock při různém pořadí položek
    const items = [...params.items].sort((a, b) =>
      `${a.productId}${a.storeId}`.localeCompare(`${b.productId}${b.storeId}`),
    );
    for (const it of items) {
      const rows = await tx
        .select()
        .from(stock)
        .where(and(eq(stock.productId, it.productId), eq(stock.storeId, it.storeId)))
        .for("update");
      const row = rows[0];
      const available = row ? row.qtyOnHand - row.qtyReserved : 0;
      if (!row || available < it.qty) {
        throw new OutOfStockError(it.productId, it.storeId, Math.max(available, 0), it.qty);
      }
      await tx
        .update(stock)
        .set({ qtyReserved: sql`${stock.qtyReserved} + ${it.qty}`, updatedAt: now })
        .where(and(eq(stock.productId, it.productId), eq(stock.storeId, it.storeId)));
      const [res] = await tx
        .insert(stockReservations)
        .values({
          orderRef: params.orderRef,
          productId: it.productId,
          storeId: it.storeId,
          qty: it.qty,
          state: "held",
          expiresAt,
          createdAt: now,
        })
        .returning({ id: stockReservations.id });
      ids.push(res.id);
    }
    return { reservationIds: ids, expiresAt };
  });
}

/** Po úspěšné platbě: rezervace se promění ve skutečný odpis ze skladu. */
export async function commitReservation(db: Db, orderRef: string, now = new Date()): Promise<number> {
  return db.transaction(async (tx) => {
    const held = await tx
      .select()
      .from(stockReservations)
      .where(and(eq(stockReservations.orderRef, orderRef), eq(stockReservations.state, "held")))
      .for("update");
    for (const r of held) {
      await tx
        .update(stock)
        .set({
          qtyOnHand: sql`${stock.qtyOnHand} - ${r.qty}`,
          qtyReserved: sql`${stock.qtyReserved} - ${r.qty}`,
          updatedAt: now,
        })
        .where(and(eq(stock.productId, r.productId), eq(stock.storeId, r.storeId)));
      await tx.insert(stockMovements).values({
        productId: r.productId,
        storeId: r.storeId,
        delta: -r.qty,
        reason: "order",
        orderRef,
        createdAt: now,
      });
      await tx.update(stockReservations).set({ state: "committed" }).where(eq(stockReservations.id, r.id));
    }
    return held.length;
  });
}

/** Zrušená nebo nezaplacená objednávka: rezervace se vrátí do volného skladu. */
export async function releaseReservation(db: Db, orderRef: string, now = new Date()): Promise<number> {
  return db.transaction(async (tx) => {
    const held = await tx
      .select()
      .from(stockReservations)
      .where(and(eq(stockReservations.orderRef, orderRef), eq(stockReservations.state, "held")))
      .for("update");
    for (const r of held) {
      await tx
        .update(stock)
        .set({ qtyReserved: sql`${stock.qtyReserved} - ${r.qty}`, updatedAt: now })
        .where(and(eq(stock.productId, r.productId), eq(stock.storeId, r.storeId)));
      await tx.update(stockReservations).set({ state: "released" }).where(eq(stockReservations.id, r.id));
    }
    return held.length;
  });
}

/** Uvolní všechny rezervace, kterým vypršel čas. Volá se před každou novou rezervací a z cronu. */
export async function expireReservations(db: Db, now = new Date()): Promise<number> {
  return db.transaction(async (tx) => {
    const expired = await tx
      .select()
      .from(stockReservations)
      .where(and(eq(stockReservations.state, "held"), lt(stockReservations.expiresAt, now)))
      .for("update");
    for (const r of expired) {
      await tx
        .update(stock)
        .set({ qtyReserved: sql`${stock.qtyReserved} - ${r.qty}`, updatedAt: now })
        .where(and(eq(stock.productId, r.productId), eq(stock.storeId, r.storeId)));
      await tx.update(stockReservations).set({ state: "released" }).where(eq(stockReservations.id, r.id));
    }
    return expired.length;
  });
}

/** Volné množství = na skladě minus rezervované. */
export function availableQty(row: { qtyOnHand: number; qtyReserved: number } | undefined | null): number {
  if (!row) return 0;
  return Math.max(0, row.qtyOnHand - row.qtyReserved);
}
