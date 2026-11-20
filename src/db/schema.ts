import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Všechny částky jsou v haléřích (integer), sazby DPH v setinách procenta (2100 = 21 %).
// Časy jsou timestamptz v UTC, převod na Europe/Prague se dělá až při zobrazení.

export const productTypeEnum = pgEnum("product_type", [
  "ready_bouquet", // hotová kytice, konkrétní kus s fotkou, leží v jedné prodejně
  "custom_tier", // kytice na míru v cenové hladině
  "stem", // květiny na kusy
  "addon", // doplňky: váza, čokoláda, plyšák
  "premium_preorder", // prémiové kytice na předobjednávku s předstihem
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "hidden",
  "sold_out",
]);

export const adminRoleEnum = pgEnum("admin_role", ["owner", "florist"]);

export const reservationStateEnum = pgEnum("reservation_state", [
  "held",
  "committed",
  "released",
]);

export const stockReasonEnum = pgEnum("stock_reason", [
  "intake", // naskladnění (nová kytice, doplnění)
  "store_sale", // prodej na prodejně jedním klepnutím
  "adjust", // ruční oprava
  "order", // odečet při potvrzení objednávky (rezervace -> prodáno)
  "release", // vrácení do skladu (zrušená objednávka)
]);

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  addressLine: text("address_line").notNull(),
  city: text("city").notNull().default("Plzeň"),
  zip: text("zip").notNull().default("301 00"),
  phone: text("phone"),
  lat: text("lat"),
  lng: text("lng"),
  delivers: boolean("delivers").notNull().default(true),
  pickupEnabled: boolean("pickup_enabled").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Otevírací doba: weekday 0 = pondělí ... 6 = neděle, časy "HH:MM". closed = zavřeno celý den.
export const storeHours = pgTable(
  "store_hours",
  {
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    weekday: integer("weekday").notNull(),
    opens: text("opens").notNull().default("08:00"),
    closes: text("closes").notNull().default("18:00"),
    closed: boolean("closed").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.storeId, t.weekday] })],
);

export const storeClosures = pgTable("store_closures", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  reason: text("reason"),
});

export const taxRates = pgTable("tax_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  rateBp: integer("rate_bp").notNull(), // setiny procenta: 2100 = 21 %
  isDefault: boolean("is_default").notNull().default(false),
  active: boolean("active").notNull().default(true),
});

export const packagingOptions = pgTable("packaging_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  surchargeCents: integer("surcharge_cents").notNull().default(0),
  taxRateId: uuid("tax_rate_id").references(() => taxRates.id),
  isDefault: boolean("is_default").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: productTypeEnum("type").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    priceCents: integer("price_cents").notNull(),
    // u kytice na míru s vlastní částkou: minimální částka; u ostatních null
    customMinCents: integer("custom_min_cents"),
    unitLabel: text("unit_label"), // např. "ks" u květin na kusy
    taxRateId: uuid("tax_rate_id").references(() => taxRates.id),
    leadTimeDays: integer("lead_time_days").notNull().default(0),
    status: productStatusEnum("status").notNull().default("draft"),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    unpublishAt: timestamp("unpublish_at", { withTimezone: true }),
    // hotová kytice patří jedné prodejně; společné produkty mají null
    storeId: uuid("store_id").references(() => stores.id, { onDelete: "set null" }),
    trackStock: boolean("track_stock").notNull().default(true),
    allowCardMessage: boolean("allow_card_message").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    sequenceNo: integer("sequence_no"), // pořadové číslo kytice pro automatický název
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("products_status_idx").on(t.status, t.type), index("products_store_idx").on(t.storeId)],
);

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Které balení je u produktu dostupné. Když produkt nemá žádný řádek, platí všechna aktivní balení.
export const productPackaging = pgTable(
  "product_packaging",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    packagingOptionId: uuid("packaging_option_id")
      .notNull()
      .references(() => packagingOptions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.packagingOptionId] })],
);

export const stock = pgTable(
  "stock",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    qtyOnHand: integer("qty_on_hand").notNull().default(0),
    qtyReserved: integer("qty_reserved").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.productId, t.storeId] })],
);

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: stockReasonEnum("reason").notNull(),
  note: text("note"),
  adminUserId: uuid("admin_user_id"),
  orderRef: text("order_ref"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stockReservations = pgTable(
  "stock_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderRef: text("order_ref").notNull(), // ve fázi 2 bude odkazovat na objednávku
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    qty: integer("qty").notNull(),
    state: reservationStateEnum("state").notNull().default("held"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reservations_order_idx").on(t.orderRef), index("reservations_state_idx").on(t.state, t.expiresAt)],
);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: adminRoleEnum("role").notNull().default("florist"),
  passwordHash: text("password_hash").notNull(),
  defaultStoreId: uuid("default_store_id").references(() => stores.id, { onDelete: "set null" }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminUserId: uuid("admin_user_id"),
  adminName: text("admin_name"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Obecné nastavení: klíč -> JSON hodnota (texty, přepínače).
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Store = typeof stores.$inferSelect;
export type StoreHour = typeof storeHours.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type PackagingOption = typeof packagingOptions.$inferSelect;
export type TaxRate = typeof taxRates.$inferSelect;
export type Stock = typeof stock.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type ProductType = (typeof productTypeEnum.enumValues)[number];
export type ProductStatus = (typeof productStatusEnum.enumValues)[number];
