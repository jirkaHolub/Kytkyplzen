"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import {
  packagingOptions,
  productImages,
  productPackaging,
  products,
  settings,
  stock,
  stockMovements,
  storeHours,
  stores,
  taxRates,
} from "@/db/schema";
import { requireAdmin, requireOwner } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { fromDateTimeLocal } from "@/lib/dates";
import { parseCzkToCents } from "@/lib/money";
import { shortId, slugify } from "@/lib/slug";
import { nextSequenceNo } from "./queries";
import type { ActionState } from "@/modules/admin/actions";

function revalidateShop() {
  revalidatePath("/", "layout");
}

const typeEnum = z.enum(["ready_bouquet", "custom_tier", "stem", "addon", "premium_preorder"]);
const statusEnum = z.enum(["draft", "published", "hidden", "sold_out"]);

const productSchema = z.object({
  type: typeEnum,
  name: z.string().trim().max(120),
  description: z.string().trim().max(2000).optional(),
  price: z.string(),
  customMin: z.string().optional(),
  unitLabel: z.string().trim().max(10).optional(),
  taxRateId: z.string().optional(),
  leadTimeDays: z.coerce.number().int().min(0).max(60).default(0),
  storeId: z.string().optional(),
  qty: z.coerce.number().int().min(0).max(999).default(1),
  trackStock: z.boolean().default(true),
  allowCardMessage: z.boolean().default(true),
  publishNow: z.boolean().default(true),
  publishAt: z.string().optional(),
  unpublishAt: z.string().optional(),
  imageUrls: z.array(z.string().url().or(z.string().startsWith("/"))).default([]),
  packagingIds: z.array(z.string()).default([]),
});

function readProductForm(formData: FormData) {
  const get = (k: string) => (formData.get(k) === null ? undefined : String(formData.get(k)));
  return productSchema.safeParse({
    type: get("type"),
    name: get("name") ?? "",
    description: get("description"),
    price: get("price") ?? "",
    customMin: get("customMin"),
    unitLabel: get("unitLabel"),
    taxRateId: get("taxRateId") || undefined,
    leadTimeDays: get("leadTimeDays") || 0,
    storeId: get("storeId") || undefined,
    qty: get("qty") || 1,
    trackStock: formData.get("trackStock") === "on",
    allowCardMessage: formData.get("allowCardMessage") !== "off",
    publishNow: formData.get("publishNow") !== "off",
    publishAt: get("publishAt"),
    unpublishAt: get("unpublishAt"),
    imageUrls: formData.getAll("imageUrl").map(String).filter(Boolean),
    packagingIds: formData.getAll("packagingId").map(String).filter(Boolean),
  });
}

/** Nová kytice z mobilu: fotka, cena, kusy, prodejna, zveřejnit. Vrací chybu nebo přesměruje. */
export async function createProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const parsed = readProductForm(formData);
  if (!parsed.success) return { error: "Zkontrolujte vyplněné údaje: " + parsed.error.issues.map((i) => i.path.join(".")).join(", ") };
  const d = parsed.data;
  const priceCents = parseCzkToCents(d.price);
  if (priceCents === null || priceCents <= 0) return { error: "Zadejte cenu v Kč." };
  const isReady = d.type === "ready_bouquet";
  if (isReady && !d.storeId) return { error: "Vyberte prodejnu, kde kytice leží." };
  const db = await getDb();
  const seq = isReady ? await nextSequenceNo() : null;
  const name = d.name || (isReady ? `Kytice ${seq}` : "Nový produkt");
  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${shortId()}`;
  const trackStock = isReady ? true : d.trackStock;
  const now = new Date();
  const publishAt = d.publishNow ? null : fromDateTimeLocal(d.publishAt);
  const unpublishAt = fromDateTimeLocal(d.unpublishAt);
  const [p] = await db
    .insert(products)
    .values({
      type: d.type,
      name,
      slug,
      description: d.description || null,
      priceCents,
      customMinCents: d.type === "custom_tier" ? parseCzkToCents(d.customMin ?? "") : null,
      unitLabel: d.type === "stem" ? d.unitLabel || "ks" : null,
      taxRateId: d.taxRateId ?? null,
      leadTimeDays: d.type === "premium_preorder" ? Math.max(1, d.leadTimeDays) : d.leadTimeDays,
      status: "published",
      publishAt,
      unpublishAt,
      storeId: isReady ? d.storeId! : null,
      trackStock,
      allowCardMessage: d.allowCardMessage,
      sequenceNo: seq,
      createdBy: session.userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  if (d.imageUrls.length) {
    await db.insert(productImages).values(d.imageUrls.map((url, i) => ({ productId: p.id, url, alt: name, sortOrder: i })));
  }
  if (d.packagingIds.length) {
    await db.insert(productPackaging).values(d.packagingIds.map((packagingOptionId) => ({ productId: p.id, packagingOptionId })));
  }
  if (trackStock && isReady) {
    await db.insert(stock).values({ productId: p.id, storeId: d.storeId!, qtyOnHand: d.qty, qtyReserved: 0 });
    if (d.qty > 0) {
      await db.insert(stockMovements).values({ productId: p.id, storeId: d.storeId!, delta: d.qty, reason: "intake", adminUserId: session.userId });
    }
  }
  await writeAudit(db, session, { action: "create", entity: "product", entityId: p.id, after: { name, priceCents, storeId: p.storeId, qty: d.qty } });
  revalidateShop();
  redirect(`/admin/nabidka?zprava=${encodeURIComponent(`${name} je ${publishAt ? "naplánovaná" : "v nabídce"}.`)}`);
}

export async function updateProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = readProductForm(formData);
  if (!parsed.success) return { error: "Zkontrolujte vyplněné údaje." };
  const d = parsed.data;
  const priceCents = parseCzkToCents(d.price);
  if (priceCents === null || priceCents <= 0) return { error: "Zadejte cenu v Kč." };
  const status = statusEnum.safeParse(formData.get("status"));
  const db = await getDb();
  const [before] = await db.select().from(products).where(eq(products.id, id));
  if (!before) return { error: "Produkt neexistuje." };
  const isReady = d.type === "ready_bouquet";
  const name = d.name || before.name;
  await db
    .update(products)
    .set({
      type: d.type,
      name,
      description: d.description || null,
      priceCents,
      customMinCents: d.type === "custom_tier" ? parseCzkToCents(d.customMin ?? "") : null,
      unitLabel: d.type === "stem" ? d.unitLabel || "ks" : null,
      taxRateId: d.taxRateId ?? null,
      leadTimeDays: d.leadTimeDays,
      status: status.success ? status.data : before.status,
      publishAt: fromDateTimeLocal(d.publishAt),
      unpublishAt: fromDateTimeLocal(d.unpublishAt),
      storeId: isReady ? (d.storeId ?? before.storeId) : null,
      trackStock: isReady ? true : d.trackStock,
      allowCardMessage: d.allowCardMessage,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));
  await db.delete(productPackaging).where(eq(productPackaging.productId, id));
  if (d.packagingIds.length) {
    await db.insert(productPackaging).values(d.packagingIds.map((packagingOptionId) => ({ productId: id, packagingOptionId })));
  }
  // nové fotky přidané v editaci
  if (d.imageUrls.length) {
    const existing = await db.select().from(productImages).where(eq(productImages.productId, id));
    const known = new Set(existing.map((e) => e.url));
    const fresh = d.imageUrls.filter((u) => !known.has(u));
    if (fresh.length) await db.insert(productImages).values(fresh.map((url, i) => ({ productId: id, url, alt: name, sortOrder: existing.length + i })));
  }
  await writeAudit(db, session, { action: "update", entity: "product", entityId: id, before: { name: before.name, priceCents: before.priceCents, status: before.status }, after: { name, priceCents, status: status.success ? status.data : before.status } });
  revalidateShop();
  redirect(`/admin/nabidka?zprava=${encodeURIComponent(`${name}: uloženo.`)}`);
}

export async function setProductStatusAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = statusEnum.parse(formData.get("status"));
  const back = String(formData.get("back") ?? "/admin/nabidka");
  const db = await getDb();
  const [before] = await db.select().from(products).where(eq(products.id, id));
  if (!before) redirect(back);
  await db.update(products).set({ status, updatedAt: new Date() }).where(eq(products.id, id));
  await writeAudit(db, session, { action: "status", entity: "product", entityId: id, before: { status: before.status }, after: { status } });
  revalidateShop();
  redirect(back);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const db = await getDb();
  const [before] = await db.select().from(products).where(eq(products.id, id));
  if (before) {
    await db.delete(products).where(eq(products.id, id));
    await writeAudit(db, session, { action: "delete", entity: "product", entityId: id, before: { name: before.name, priceCents: before.priceCents } });
  }
  revalidateShop();
  redirect("/admin/nabidka?zprava=Smazáno.");
}

export async function removeImageAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = String(formData.get("imageId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const db = await getDb();
  await db.delete(productImages).where(and(eq(productImages.id, id), eq(productImages.productId, productId)));
  await writeAudit(db, session, { action: "remove_image", entity: "product", entityId: productId });
  revalidateShop();
  redirect(`/admin/nabidka/${productId}`);
}

/** Úprava skladu: +1 / −1 / prodáno na prodejně. */
export async function adjustStockAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const storeId = String(formData.get("storeId") ?? "");
  const delta = Number(formData.get("delta") ?? 0);
  const reason = formData.get("reason") === "store_sale" ? "store_sale" : formData.get("reason") === "intake" ? "intake" : "adjust";
  const back = String(formData.get("back") ?? "/admin/sklad");
  if (!Number.isInteger(delta) || delta === 0 || !productId || !storeId) redirect(back);
  const db = await getDb();
  await db.transaction(async (tx) => {
    const rows = await tx.select().from(stock).where(and(eq(stock.productId, productId), eq(stock.storeId, storeId))).for("update");
    const row = rows[0];
    if (!row) {
      if (delta < 0) return;
      await tx.insert(stock).values({ productId, storeId, qtyOnHand: delta, qtyReserved: 0 });
    } else {
      const available = row.qtyOnHand - row.qtyReserved;
      if (delta < 0 && available + delta < 0) return; // nelze jít pod rezervované
      await tx.update(stock).set({ qtyOnHand: sql`${stock.qtyOnHand} + ${delta}`, updatedAt: new Date() }).where(and(eq(stock.productId, productId), eq(stock.storeId, storeId)));
    }
    await tx.insert(stockMovements).values({ productId, storeId, delta, reason, adminUserId: session.userId });
    // automaticky přepnout stav podle skladu u hotových kytic
    const [p] = await tx.select().from(products).where(eq(products.id, productId));
    if (p && p.type === "ready_bouquet" && p.trackStock) {
      const [s] = await tx.select().from(stock).where(and(eq(stock.productId, productId), eq(stock.storeId, storeId)));
      const avail = s ? s.qtyOnHand - s.qtyReserved : 0;
      if (avail <= 0 && p.status === "published") await tx.update(products).set({ status: "sold_out" }).where(eq(products.id, productId));
      if (avail > 0 && p.status === "sold_out") await tx.update(products).set({ status: "published" }).where(eq(products.id, productId));
    }
  });
  await writeAudit(db, session, { action: "stock", entity: "product", entityId: productId, after: { storeId, delta, reason } });
  revalidateShop();
  redirect(back);
}

// ---------- nastavení ----------

export async function updateStoreAction(formData: FormData): Promise<void> {
  const session = await requireOwner();
  const id = String(formData.get("id") ?? "");
  const db = await getDb();
  const [before] = await db.select().from(stores).where(eq(stores.id, id));
  if (!before) redirect("/admin/nastaveni");
  const data = {
    name: String(formData.get("name") ?? before.name).trim() || before.name,
    shortName: String(formData.get("shortName") ?? before.shortName).trim() || before.shortName,
    addressLine: String(formData.get("addressLine") ?? before.addressLine).trim() || before.addressLine,
    city: String(formData.get("city") ?? before.city).trim() || before.city,
    zip: String(formData.get("zip") ?? before.zip).trim() || before.zip,
    phone: String(formData.get("phone") ?? "").trim() || null,
    lat: String(formData.get("lat") ?? "").trim() || null,
    lng: String(formData.get("lng") ?? "").trim() || null,
    delivers: formData.get("delivers") === "on",
    pickupEnabled: formData.get("pickupEnabled") === "on",
    active: formData.get("active") === "on",
  };
  await db.update(stores).set(data).where(eq(stores.id, id));
  for (let d = 0; d < 7; d++) {
    const closed = formData.get(`closed_${d}`) === "on";
    const opens = String(formData.get(`opens_${d}`) ?? "08:00") || "08:00";
    const closes = String(formData.get(`closes_${d}`) ?? "18:00") || "18:00";
    await db
      .insert(storeHours)
      .values({ storeId: id, weekday: d, opens, closes, closed })
      .onConflictDoUpdate({ target: [storeHours.storeId, storeHours.weekday], set: { opens, closes, closed } });
  }
  await writeAudit(db, session, { action: "update", entity: "store", entityId: id, before: { name: before.name }, after: data });
  revalidateShop();
  redirect(`/admin/nastaveni/prodejny/${id}?zprava=Uloženo.`);
}

export async function savePackagingAction(formData: FormData): Promise<void> {
  const session = await requireOwner();
  const db = await getDb();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/nastaveni?chyba=Zadejte název balení.");
  const surchargeCents = parseCzkToCents(String(formData.get("surcharge") ?? "0")) ?? 0;
  const data = {
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    surchargeCents,
    active: formData.get("active") !== "off",
    isDefault: formData.get("isDefault") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
  if (id) {
    await db.update(packagingOptions).set(data).where(eq(packagingOptions.id, id));
  } else {
    await db.insert(packagingOptions).values(data);
  }
  await writeAudit(db, session, { action: id ? "update" : "create", entity: "packaging", entityId: id || null, after: data });
  revalidateShop();
  redirect("/admin/nastaveni?zprava=Balení uloženo.");
}

export async function deletePackagingAction(formData: FormData): Promise<void> {
  const session = await requireOwner();
  const db = await getDb();
  const id = String(formData.get("id") ?? "");
  await db.update(packagingOptions).set({ active: false }).where(eq(packagingOptions.id, id));
  await writeAudit(db, session, { action: "deactivate", entity: "packaging", entityId: id });
  revalidateShop();
  redirect("/admin/nastaveni");
}

export async function saveTaxRateAction(formData: FormData): Promise<void> {
  const session = await requireOwner();
  const db = await getDb();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const pct = Number(String(formData.get("percent") ?? "").replace(",", "."));
  if (!name || !Number.isFinite(pct) || pct < 0 || pct > 100) redirect("/admin/nastaveni?chyba=Zadejte název a sazbu v procentech.");
  const rateBp = Math.round(pct * 100);
  const isDefault = formData.get("isDefault") === "on";
  if (isDefault) await db.update(taxRates).set({ isDefault: false });
  if (id) await db.update(taxRates).set({ name, rateBp, isDefault }).where(eq(taxRates.id, id));
  else await db.insert(taxRates).values({ name, rateBp, isDefault });
  await writeAudit(db, session, { action: id ? "update" : "create", entity: "tax_rate", entityId: id || null, after: { name, rateBp, isDefault } });
  redirect("/admin/nastaveni?zprava=Sazba uložena.");
}

export async function saveTextsAction(formData: FormData): Promise<void> {
  const session = await requireOwner();
  const db = await getDb();
  const keys = ["texts.infoStrip", "texts.tagline"];
  for (const key of keys) {
    const value = String(formData.get(key) ?? "").trim();
    await db.insert(settings).values({ key, value, updatedAt: new Date() }).onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  }
  await writeAudit(db, session, { action: "update", entity: "settings", entityId: "texts" });
  revalidateShop();
  redirect("/admin/nastaveni?zprava=Texty uloženy.");
}
