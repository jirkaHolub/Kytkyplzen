import type { Db } from "@/db";
import {
  packagingOptions,
  productImages,
  products,
  settings,
  stock,
  storeHours,
  stores,
  taxRates,
} from "@/db/schema";

/**
 * Ukázková data. Všechny hodnoty (ceny, sazby, otevírací doby, texty) jsou UKÁZKOVÉ
 * a jdou změnit v adminu. Seed je idempotentní: když už existují prodejny, nic nedělá.
 */
export async function seedDatabase(db: Db): Promise<{ seeded: boolean }> {
  const existing = await db.select().from(stores).limit(1);
  if (existing.length > 0) return { seeded: false };

  const [sedlackova, hamburk] = await db
    .insert(stores)
    .values([
      {
        slug: "sedlackova",
        name: "Kytky Plzeň, Sedláčkova",
        shortName: "Sedláčkova 9",
        addressLine: "Sedláčkova 191/9",
        city: "Plzeň",
        zip: "301 00",
        phone: "+420 732 466 589",
        lat: "49.746392",
        lng: "13.374917",
        sortOrder: 1,
      },
      {
        slug: "hamburk",
        name: "Kytky Plzeň, Paluba Hamburk",
        shortName: "Paluba Hamburk",
        addressLine: "Paluba Hamburk, Šumavská (u hlavního nádraží)",
        city: "Plzeň",
        zip: "301 00",
        phone: "+420 732 466 589",
        lat: "49.743700",
        lng: "13.387300",
        sortOrder: 2,
      },
    ])
    .returning();

  // Otevírací doba podle současného webu (ukázka): Sedláčkova Po–Ne 8–18, Hamburk Po–So 8–18, Ne 9–18.
  const hours = [];
  for (let d = 0; d < 7; d++) {
    hours.push({ storeId: sedlackova.id, weekday: d, opens: "08:00", closes: "18:00", closed: false });
    hours.push({ storeId: hamburk.id, weekday: d, opens: d === 6 ? "09:00" : "08:00", closes: "18:00", closed: false });
  }
  await db.insert(storeHours).values(hours);

  // Sazby DPH jsou UKÁZKOVÉ, potvrdí je účetní. Řezané květiny 21 %, potraviny 12 %.
  const [vat21, vat12] = await db
    .insert(taxRates)
    .values([
      { name: "Základní 21 %", rateBp: 2100, isDefault: true },
      { name: "Snížená 12 %", rateBp: 1200, isDefault: false },
    ])
    .returning();

  const [paper, box, basket] = await db
    .insert(packagingOptions)
    .values([
      { name: "Papír v barvě značky", description: "růžový nebo krémový", surchargeCents: 0, isDefault: true, sortOrder: 1, taxRateId: vat21.id },
      { name: "Dárková krabice", description: "kytice v aquapěně", surchargeCents: 15000, sortOrder: 2, taxRateId: vat21.id },
      { name: "Proutěný košík", description: null, surchargeCents: 25000, sortOrder: 3, taxRateId: vat21.id },
    ])
    .returning();
  void paper;
  void box;
  void basket;

  await db.insert(settings).values([
    { key: "texts.infoStrip", value: "Dnes rozvážíme do 18:00. Objednávky na dnešek přijímáme do 15:00. (ukázkový text)" },
    { key: "texts.tagline", value: "Květiny až ke dveřím" },
    { key: "shop.sameDayCutoff", value: "15:00" },
    { key: "shop.deliveryFromCents", value: 9900 },
    { key: "shop.cardMessageMaxChars", value: 150 },
  ]);

  type Seed = {
    type: "ready_bouquet" | "custom_tier" | "stem" | "addon" | "premium_preorder";
    name: string;
    slug: string;
    priceCents: number;
    description?: string;
    image?: string;
    storeId?: string;
    qty?: number;
    leadTimeDays?: number;
    trackStock?: boolean;
    unitLabel?: string;
    customMinCents?: number;
    taxRateId?: string;
    sequenceNo?: number;
  };

  const seeds: Seed[] = [
    { type: "ready_bouquet", name: "Pudrová hortenzie", slug: "pudrova-hortenzie", priceCents: 51000, image: "https://cdn.myshoptet.com/usr/www.kytkyplzen.com/user/shop/big/8475_kytka-207.jpg", storeId: sedlackova.id, qty: 1, sequenceNo: 207, description: "Hortenzie, tulipán, trsová růže a frézie v pudrově růžovém papíru. Kytice na fotce je přesně ta, kterou dostanete. Výška asi 45 cm." },
    { type: "ready_bouquet", name: "Bílé gerbery a hortenzie", slug: "bile-gerbery-a-hortenzie", priceCents: 89900, image: "https://cdn.myshoptet.com/usr/www.kytkyplzen.com/user/shop/big/8484_kytka-210.jpg", storeId: hamburk.id, qty: 2, sequenceNo: 210, description: "Bílé gerbery, hortenzie a chryzantémy s jemně růžovými akcenty v krémovém papíru." },
    { type: "ready_bouquet", name: "Fialové chryzantémy", slug: "fialove-chryzantemy", priceCents: 29500, image: "https://cdn.myshoptet.com/usr/www.kytkyplzen.com/user/shop/big/8487_kytka-211.jpg", storeId: sedlackova.id, qty: 3, sequenceNo: 211, description: "Fialové chryzantémy s heřmánkem v kraftovém papíru. Menší kytice pro radost jen tak." },
    { type: "ready_bouquet", name: "Růžová s eustomou", slug: "ruzova-s-eustomou", priceCents: 56500, image: "https://cdn.myshoptet.com/usr/www.kytkyplzen.com/user/shop/big/8481_kytka-209.jpg", storeId: hamburk.id, qty: 1, sequenceNo: 209, description: "Trsové růže, bílé chryzantémy a eustoma v sytě růžovém papíru." },
    { type: "ready_bouquet", name: "Červená romantika", slug: "cervena-romantika", priceCents: 87500, image: "https://cdn.myshoptet.com/usr/www.kytkyplzen.com/user/shop/big/8457_kytka-202202.jpg", storeId: sedlackova.id, qty: 2, sequenceNo: 202, description: "Červené růže, gerbery a bílé chryzantémy v krémovém papíru se stuhou." },
    { type: "ready_bouquet", name: "Modrý košík", slug: "modry-kosik", priceCents: 70000, image: "https://cdn.myshoptet.com/usr/www.kytkyplzen.com/user/shop/big/8469_kytka-205.jpg", storeId: hamburk.id, qty: 0, sequenceNo: 205, description: "Modré chryzantémy, červené gerbery a bílé pompony v košíku." },
    { type: "custom_tier", name: "Kytice na míru 1 000 Kč", slug: "kytice-na-miru-1000", priceCents: 100000, trackStock: false, description: "Barvy, styl a příležitost zadáte v objednávce, floristka uváže kytici podle vás." },
    { type: "custom_tier", name: "Kytice na míru 1 500 Kč", slug: "kytice-na-miru-1500", priceCents: 150000, trackStock: false, description: "Nejčastější volba. Větší kytice podle vašich barev a příležitosti." },
    { type: "custom_tier", name: "Kytice na míru 2 000 Kč", slug: "kytice-na-miru-2000", priceCents: 200000, trackStock: false, description: "Velká kytice na oslavu i výročí." },
    { type: "custom_tier", name: "Kytice na míru, vlastní částka", slug: "kytice-na-miru-vlastni", priceCents: 60000, customMinCents: 60000, trackStock: false, description: "Částku zadáte sami, minimálně 600 Kč." },
    { type: "stem", name: "Růže Ekvádor 70 cm", slug: "ruze-ekvador-70-cm", priceCents: 9500, unitLabel: "ks", image: "https://cdn.myshoptet.com/usr/www.kytkyplzen.com/user/shop/big/8460_kytka-203203.jpg", trackStock: false, description: "Prémiové růže z Ekvádoru, délka 70 cm. Červená, bílá, pudrová." },
    { type: "stem", name: "Růže Mondial 70 cm", slug: "ruze-mondial-70-cm", priceCents: 11000, unitLabel: "ks", image: "https://cdn.myshoptet.com/usr/www.kytkyplzen.com/user/shop/big/8463_kytka-204204.jpg", trackStock: false, description: "Bílá odrůda Mondial, délka 70 cm." },
    { type: "addon", name: "Raffaello 80 g", slug: "raffaello-80-g", priceCents: 8900, trackStock: false, taxRateId: vat12.id, description: "Kokosové kuličky, 80 g." },
    { type: "addon", name: "Medvídek 30 cm", slug: "medvidek-30-cm", priceCents: 34900, trackStock: false, description: "Plyšový medvídek, 30 cm." },
    { type: "addon", name: "Váza skleněná", slug: "vaza-sklenena", priceCents: 29900, trackStock: false, description: "Čirá skleněná váza, výška 25 cm." },
    { type: "premium_preorder", name: "51 ekvádorských růží", slug: "51-ekvadorskych-ruzi", priceCents: 490000, image: "https://cdn.myshoptet.com/usr/www.kytkyplzen.com/user/shop/big/8478_kytka-208.jpg", trackStock: false, leadTimeDays: 5, description: "Kytice 51 prémiových růží z Ekvádoru. Objednávka nejméně 5 dní předem." },
    { type: "premium_preorder", name: "Svatební kytice", slug: "svatebni-kytice", priceCents: 200000, image: "https://cdn.myshoptet.com/usr/www.kytkyplzen.com/user/shop/big/8472_kytka-206.jpg", trackStock: false, leadTimeDays: 7, description: "Svatební kytice podle konzultace s floristkou, od 2 000 Kč. Objednávka nejméně 7 dní předem." },
  ];

  for (const s of seeds) {
    const [p] = await db
      .insert(products)
      .values({
        type: s.type,
        name: s.name,
        slug: s.slug,
        description: s.description ?? null,
        priceCents: s.priceCents,
        customMinCents: s.customMinCents ?? null,
        unitLabel: s.unitLabel ?? null,
        taxRateId: s.taxRateId ?? vat21.id,
        leadTimeDays: s.leadTimeDays ?? 0,
        status: "published",
        storeId: s.storeId ?? null,
        trackStock: s.trackStock ?? true,
        sequenceNo: s.sequenceNo ?? null,
      })
      .returning();
    if (s.image) {
      await db.insert(productImages).values({ productId: p.id, url: s.image, width: 1024, height: 1024, alt: s.name });
    }
    if ((s.trackStock ?? true) && s.storeId) {
      await db.insert(stock).values({ productId: p.id, storeId: s.storeId, qtyOnHand: s.qty ?? 0, qtyReserved: 0 });
    }
  }


  return { seeded: true };
}
