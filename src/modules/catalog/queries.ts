import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  adminUsers,
  packagingOptions,
  productImages,
  productPackaging,
  products,
  settings,
  stock,
  storeHours,
  stores,
  taxRates,
  type PackagingOption,
  type Product,
  type ProductImage,
  type Store,
  type TaxRate,
} from "@/db/schema";
import { computeAvailability, type Availability } from "./availability";
import { availableQty, expireReservations } from "@/modules/inventory/reservations";

export type ProductWithDetails = Product & {
  images: ProductImage[];
  stockByStore: { storeId: string; qtyOnHand: number; qtyReserved: number; available: number }[];
  availability: Availability;
  store: Store | null;
};

export async function listStores(): Promise<Store[]> {
  const db = await getDb();
  return db.select().from(stores).where(eq(stores.active, true)).orderBy(asc(stores.sortOrder));
}

export async function listAllStores(): Promise<Store[]> {
  const db = await getDb();
  return db.select().from(stores).orderBy(asc(stores.sortOrder));
}

export async function getStoreHours(storeId: string) {
  const db = await getDb();
  return db.select().from(storeHours).where(eq(storeHours.storeId, storeId)).orderBy(asc(storeHours.weekday));
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const db = await getDb();
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  return rows.length ? (rows[0].value as T) : fallback;
}

export async function listTaxRates(): Promise<TaxRate[]> {
  const db = await getDb();
  return db.select().from(taxRates).orderBy(desc(taxRates.isDefault), asc(taxRates.rateBp));
}

export async function listPackaging(activeOnly = true): Promise<PackagingOption[]> {
  const db = await getDb();
  const q = db.select().from(packagingOptions).orderBy(asc(packagingOptions.sortOrder));
  return activeOnly ? q.where(eq(packagingOptions.active, true)) : q;
}

async function attachDetails(rows: Product[], now = new Date()): Promise<ProductWithDetails[]> {
  if (rows.length === 0) return [];
  const db = await getDb();
  const ids = rows.map((r) => r.id);
  const [imgs, stocks, storeRows] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder), asc(productImages.createdAt)),
    db.select().from(stock).where(inArray(stock.productId, ids)),
    db.select().from(stores),
  ]);
  const storeMap = new Map(storeRows.map((s) => [s.id, s]));
  return rows.map((p) => {
    const images = imgs.filter((i) => i.productId === p.id);
    const stockByStore = stocks
      .filter((s) => s.productId === p.id)
      .map((s) => ({ storeId: s.storeId, qtyOnHand: s.qtyOnHand, qtyReserved: s.qtyReserved, available: availableQty(s) }));
    const availability = computeAvailability(
      {
        status: p.status,
        publishAt: p.publishAt,
        unpublishAt: p.unpublishAt,
        trackStock: p.trackStock,
        leadTimeDays: p.leadTimeDays,
        stockByStore,
      },
      now,
    );
    return { ...p, images, stockByStore, availability, store: p.storeId ? (storeMap.get(p.storeId) ?? null) : null };
  });
}

/** Veřejná nabídka: zveřejněné produkty, volitelně jen jedna prodejna u hotových kytic. */
export async function listOffer(opts: { storeId?: string | null } = {}): Promise<ProductWithDetails[]> {
  const db = await getDb();
  await expireReservations(db).catch(() => 0);
  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.status, ["published", "sold_out"]))
    .orderBy(asc(products.sortOrder), desc(products.createdAt));
  const detailed = await attachDetails(rows);
  return detailed.filter((p) => {
    if (!p.availability.visible) return false;
    if (opts.storeId && p.type === "ready_bouquet" && p.storeId !== opts.storeId) return false;
    return true;
  });
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const db = await getDb();
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!rows.length) return null;
  const [d] = await attachDetails(rows);
  return d;
}

export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  const db = await getDb();
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!rows.length) return null;
  const [d] = await attachDetails(rows);
  return d;
}

/** Admin: všechny produkty včetně konceptů a skrytých. */
export async function listProductsAdmin(opts: { type?: Product["type"]; storeId?: string | null } = {}): Promise<ProductWithDetails[]> {
  const db = await getDb();
  await expireReservations(db).catch(() => 0);
  const conds = [];
  if (opts.type) conds.push(eq(products.type, opts.type));
  if (opts.storeId) conds.push(eq(products.storeId, opts.storeId));
  const rows = await db
    .select()
    .from(products)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(products.createdAt));
  return attachDetails(rows);
}

export async function getProductPackagingIds(productId: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.select().from(productPackaging).where(eq(productPackaging.productId, productId));
  return rows.map((r) => r.packagingOptionId);
}

/** Balení dostupné u produktu: explicitní výběr, nebo všechna aktivní. */
export async function packagingForProduct(productId: string): Promise<PackagingOption[]> {
  const ids = await getProductPackagingIds(productId);
  const all = await listPackaging(true);
  if (ids.length === 0) return all;
  return all.filter((p) => ids.includes(p.id));
}

export async function nextSequenceNo(): Promise<number> {
  const db = await getDb();
  const [row] = await db.select({ m: sql<number>`coalesce(max(${products.sequenceNo}), 200)` }).from(products);
  return Number(row?.m ?? 200) + 1;
}

export async function countAdminUsers(): Promise<number> {
  const db = await getDb();
  const [row] = await db.select({ n: sql<number>`count(*)` }).from(adminUsers);
  return Number(row?.n ?? 0);
}
