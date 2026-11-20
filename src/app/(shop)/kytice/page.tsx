import type { Metadata } from "next";
import { BottomNav } from "@/components/shop/Chrome";
import { NoDatabase } from "@/components/shop/NoDatabase";
import { ProductCard } from "@/components/shop/ProductCard";
import { ChipLink, SectionTitle } from "@/components/ui";
import { hasDatabase } from "@/db";
import { listOffer, listStores } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kytice" };

const types = [
  { key: "", label: "Vše" },
  { key: "ready_bouquet", label: "Hotové dnes" },
  { key: "custom_tier", label: "Na míru" },
  { key: "stem", label: "Na kusy" },
  { key: "premium_preorder", label: "Prémiové" },
];

export default async function CatalogPage(props: PageProps<"/kytice">) {
  if (!hasDatabase()) return <NoDatabase />;
  const sp = await props.searchParams;
  const typ = typeof sp.typ === "string" ? sp.typ : "";
  const storeSlug = typeof sp.prodejna === "string" ? sp.prodejna : "";
  const stores = await listStores();
  const store = stores.find((s) => s.slug === storeSlug) ?? null;
  const offer = (await listOffer({ storeId: store?.id ?? null })).filter((p) => p.type !== "addon" && (!typ || p.type === typ));
  const q = (t: string, s: string) => `/kytice?${new URLSearchParams({ ...(t ? { typ: t } : {}), ...(s ? { prodejna: s } : {}) })}`;

  return (
    <>
      <SectionTitle>Kytice</SectionTitle>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2 pt-1">
        {types.map((t) => (
          <ChipLink key={t.key} href={q(t.key, storeSlug)} active={typ === t.key}>
            {t.label}
          </ChipLink>
        ))}
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5">
        <ChipLink href={q(typ, "")} active={!store}>
          Obě prodejny
        </ChipLink>
        {stores.map((s) => (
          <ChipLink key={s.id} href={q(typ, s.slug)} active={store?.id === s.id}>
            {s.shortName}
          </ChipLink>
        ))}
      </div>
      {offer.length === 0 ? (
        <p className="px-4 py-10 text-center text-[14px] text-muted">V této kategorii teď nic není.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 py-1.5">
          {offer.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
      <div className="flex-1" />
      <BottomNav current="/kytice" />
    </>
  );
}
