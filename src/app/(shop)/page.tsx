import Link from "next/link";
import { BottomNav } from "@/components/shop/Chrome";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChipLink, Demo, Pill, SectionTitle } from "@/components/ui";
import { hasDatabase } from "@/db";
import { formatDayShort } from "@/lib/dates";
import { formatCzk } from "@/lib/money";
import { todayInPrague } from "@/modules/catalog/availability";
import { getSetting, listOffer, listStores } from "@/modules/catalog/queries";
import { NoDatabase } from "@/components/shop/NoDatabase";

export const dynamic = "force-dynamic";

export default async function HomePage(props: PageProps<"/">) {
  if (!hasDatabase()) return <NoDatabase />;
  const sp = await props.searchParams;
  const storeSlug = typeof sp.prodejna === "string" ? sp.prodejna : null;
  const [stores, infoStrip] = await Promise.all([listStores(), getSetting("texts.infoStrip", "")]);
  const store = stores.find((s) => s.slug === storeSlug) ?? null;
  const offer = await listOffer({ storeId: store?.id ?? null });
  const ready = offer.filter((p) => p.type === "ready_bouquet");
  const tiers = offer.filter((p) => p.type === "custom_tier").sort((a, b) => (a.customMinCents ? 1 : 0) - (b.customMinCents ? 1 : 0) || a.priceCents - b.priceCents);
  const stems = offer.filter((p) => p.type === "stem").sort((a, b) => a.priceCents - b.priceCents);
  const premium = offer.filter((p) => p.type === "premium_preorder");
  const addons = offer.filter((p) => p.type === "addon");
  const today = todayInPrague();

  return (
    <>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5 pt-1" role="group" aria-label="Prodejna">
        <ChipLink href="/" active={!store}>
          Obě prodejny
        </ChipLink>
        {stores.map((s) => (
          <ChipLink key={s.id} href={`/?prodejna=${s.slug}`} active={store?.id === s.id}>
            {s.shortName}
          </ChipLink>
        ))}
      </div>

      {infoStrip && (
        <div className="mx-4 mb-1 mt-1.5 flex items-center gap-3 rounded-card bg-blush px-3.5 py-3 text-[14px]">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white">🚕</div>
          <div>{infoStrip}</div>
        </div>
      )}

      <SectionTitle hand={formatDayShort(today)} action={<Link href="/kytice" className="text-[14px] font-bold text-brand-text">Vše ({ready.length})</Link>}>
        Dnes v nabídce
      </SectionTitle>
      {ready.length === 0 ? (
        <p className="px-4 py-6 text-center text-[14px] text-muted">
          Dnešní nabídka se teprve připravuje. Napište nám na Instagram nebo zavolejte, uvážeme kytici na míru.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 py-1.5">
          {ready.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}

      {tiers.length > 0 && (
        <>
          <SectionTitle hand="my to uvážeme">Nechám to na floristce</SectionTitle>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-1 pt-1.5">
            {tiers.map((t) => (
              <Link
                key={t.id}
                href={`/kytice/${t.slug}`}
                className="flex min-h-[120px] w-[150px] shrink-0 flex-col gap-1 rounded-card border-[1.5px] border-dashed border-line-2 bg-gradient-to-br from-blush to-white p-3.5"
              >
                <span className="font-hand text-[22px] text-brand-text">{t.name.replace(/^Kytice na míru,? ?/i, "") || "Kytice"}</span>
                <span className="text-[20px] font-extrabold">{t.customMinCents ? `od ${formatCzk(t.customMinCents)}` : formatCzk(t.priceCents)}</span>
                <span className="text-[12px] text-muted">{t.description?.split(".")[0]}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {stems.length > 0 && (
        <>
          <SectionTitle action={<Link href="/kytice?typ=stem" className="text-[14px] font-bold text-brand-text">Ceník</Link>}>Růže na kusy</SectionTitle>
          <div className="grid grid-cols-2 gap-3 px-4 py-1.5">
            {stems.map((p) => (
              <ProductCard key={p.id} p={p} wide />
            ))}
          </div>
        </>
      )}

      {premium.length > 0 && (
        <>
          <SectionTitle action={<Pill tone="warn">min. {Math.min(...premium.map((p) => p.leadTimeDays))} dní předem</Pill>}>
            Prémiové na předobjednávku
          </SectionTitle>
          <div className="grid grid-cols-2 gap-3 px-4 py-1.5">
            {premium.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </>
      )}

      {addons.length > 0 && (
        <>
          <SectionTitle action={<Link href="/doplnky" className="text-[14px] font-bold text-brand-text">Vše</Link>}>Doplňky ke kytici</SectionTitle>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-4 pb-2 pt-1.5">
            {addons.map((a) => (
              <Link key={a.id} href={`/doplnky/${a.slug}`} className="flex w-[118px] shrink-0 flex-col gap-1 rounded-field border-[1.5px] border-line-2 bg-white p-2.5 text-[12px] font-bold">
                <span className="text-[26px]">{a.name.toLowerCase().includes("medv") ? "🧸" : a.name.toLowerCase().includes("váz") ? "🏺" : "🍫"}</span>
                {a.name}
                <span className="font-extrabold text-brand-text">{formatCzk(a.priceCents)}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <p className="px-4 pt-3 text-center">
        <Demo>Ceny a texty jsou ukázkové, upravují se v administraci.</Demo>
      </p>
      <div className="flex-1" />
      <BottomNav current="/" />
    </>
  );
}
