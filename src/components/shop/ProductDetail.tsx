import Image from "next/image";
import Link from "next/link";
import type { PackagingOption } from "@/db/schema";
import { formatDayShort } from "@/lib/dates";
import { formatCzk } from "@/lib/money";
import type { ProductWithDetails } from "@/modules/catalog/queries";
import { todayInPrague } from "@/modules/catalog/availability";
import { ButtonLink, Card, CardTitle, Pill } from "@/components/ui";
import { priceLabel } from "./ProductCard";

const typeLabel: Record<ProductWithDetails["type"], string> = {
  ready_bouquet: "Hotová kytice",
  custom_tier: "Kytice na míru",
  stem: "Květiny na kusy",
  addon: "Doplněk",
  premium_preorder: "Na předobjednávku",
};

export function ProductDetail({
  p,
  packaging,
  addons,
  stores,
  backHref,
  backLabel,
}: {
  p: ProductWithDetails;
  packaging: PackagingOption[];
  addons: ProductWithDetails[];
  stores: { id: string; shortName: string }[];
  backHref: string;
  backLabel: string;
}) {
  const img = p.images[0];
  const a = p.availability;
  const today = todayInPrague();
  const availabilityText = (() => {
    if (!a.purchasable) return "Momentálně vyprodáno. Podívejte se na ostatní kytice v nabídce.";
    if (p.leadTimeDays > 0) return `Objednávka nejméně ${p.leadTimeDays} dní předem. Nejdříve ${formatDayShort(a.earliestDate)}.`;
    if (p.type === "ready_bouquet" && p.store) return `K dispozici dnes (${formatDayShort(today)}) na prodejně ${p.store.shortName}, rozvozem i k osobnímu odběru.`;
    return "Uvážeme na vybraný den, rozvozem po Plzni nebo k odběru na prodejně.";
  })();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? undefined,
    image: img?.url,
    offers: {
      "@type": "Offer",
      priceCurrency: "CZK",
      price: (p.priceCents / 100).toFixed(0),
      availability: a.purchasable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="relative bg-blush">
        {img ? (
          <div className="relative aspect-square w-full">
            <Image src={img.url} alt={img.alt ?? p.name} fill priority sizes="(max-width: 640px) 100vw, 520px" className="object-cover" />
          </div>
        ) : (
          <div className="grid aspect-[4/3] place-items-center font-hand text-[32px] text-brand-text">{p.name}</div>
        )}
        <Link href={backHref} className="absolute left-3 top-3 inline-flex min-h-[44px] items-center gap-1 rounded-full bg-white px-3.5 text-[14px] font-bold text-brand-text shadow">
          ‹ {backLabel}
        </Link>
        {p.images.length > 1 && (
          <div className="no-scrollbar absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {p.images.map((im, i) => (
              <i key={im.id} className={i === 0 ? "h-1.5 w-4 rounded bg-white" : "h-1.5 w-1.5 rounded-full bg-white/60"} />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2.5 px-4 pb-1 pt-3.5">
        <h1 className="text-[22px] font-extrabold">{p.name}</h1>
        <span className="whitespace-nowrap text-[24px] font-extrabold text-brand-text">{priceLabel(p)}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 px-4 pb-2 pt-1">
        <Pill tone="pink">{typeLabel[p.type]}</Pill>
        {a.badge === "last_one" && <Pill tone="warn">Poslední kus</Pill>}
        {a.badge === "sold_out" && <Pill tone="gray">Vyprodáno</Pill>}
        {a.badge === "preorder" && <Pill tone="warn">min. {p.leadTimeDays} dní předem</Pill>}
        {p.store && <Pill tone="gray">{p.store.shortName}</Pill>}
        {!p.store && p.type === "ready_bouquet" && stores.length > 0 && <Pill tone="gray">obě prodejny</Pill>}
      </div>
      <div className={`mx-4 mb-2.5 mt-1 flex items-center gap-2.5 rounded-field px-3 py-2.5 text-[13px] font-bold ${a.purchasable ? "bg-ok-bg text-ok" : "bg-[#F1EBEE] text-muted"}`}>
        ⏱ {availabilityText}
      </div>
      {p.description && <p className="px-4 pb-2.5 pt-1 text-[14px]">{p.description}</p>}

      {p.type !== "addon" && p.type !== "stem" && packaging.length > 0 && (
        <Card className="mx-4 mb-3">
          <CardTitle>Balení</CardTitle>
          <div className="flex flex-col gap-2">
            {packaging.map((pk, i) => (
              <div key={pk.id} className={`flex min-h-[48px] items-center gap-3 rounded-field border-[1.5px] px-3 py-2 ${i === 0 ? "border-brand bg-blush" : "border-line-2 bg-white"}`}>
                <span className={`grid h-[22px] w-[22px] place-items-center rounded-full border-2 ${i === 0 ? "border-brand" : "border-line-2"}`}>
                  {i === 0 && <span className="h-3 w-3 rounded-full bg-brand" />}
                </span>
                <span className="flex-1 text-[14px] font-bold">
                  {pk.name}
                  {pk.description && <small className="block text-[12px] font-semibold text-muted">{pk.description}</small>}
                </span>
                <span className="text-[14px] font-extrabold">{pk.surchargeCents ? `+ ${formatCzk(pk.surchargeCents)}` : "v ceně"}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {addons.length > 0 && (
        <Card className="mx-4 mb-3">
          <CardTitle>Přidat k tomu</CardTitle>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
            {addons.map((ad) => (
              <Link key={ad.id} href={`/doplnky/${ad.slug}`} className="flex w-[118px] shrink-0 flex-col gap-1 rounded-field border-[1.5px] border-line-2 bg-white p-2.5 text-[12px] font-bold">
                <span className="text-[26px]">{ad.name.toLowerCase().includes("medv") ? "🧸" : ad.name.toLowerCase().includes("váz") ? "🏺" : "🍫"}</span>
                {ad.name}
                <span className="font-extrabold text-brand-text">{formatCzk(ad.priceCents)}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Card className="mx-4 mb-3">
        <CardTitle>Dobré vědět</CardTitle>
        <div className="flex justify-between gap-3 text-[14px]"><span className="text-muted">Doprava po Plzni</span><span>cena podle adresy, ve fázi 2</span></div>
        <div className="flex justify-between gap-3 text-[14px]"><span className="text-muted">Osobní odběr</span><span>zdarma, obě prodejny</span></div>
        <div className="flex justify-between gap-3 text-[14px]"><span className="text-muted">Vzkaz na kartičku</span><span>{p.allowCardMessage ? "zdarma" : "u tohoto produktu ne"}</span></div>
      </Card>

      <div className="flex-1" />
      <div className="safe-bottom sticky bottom-0 bg-gradient-to-b from-transparent to-bg px-4 pt-2.5">
        {a.purchasable ? (
          <ButtonLink href={`/objednavka?produkt=${p.slug}`}>
            Objednat <span className="ml-auto opacity-95">{priceLabel(p)}</span>
          </ButtonLink>
        ) : (
          <ButtonLink href="/kytice" variant="secondary">
            Podívat se na ostatní kytice
          </ButtonLink>
        )}
      </div>
    </>
  );
}
