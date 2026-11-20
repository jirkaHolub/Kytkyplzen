import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav, AdminTop } from "@/components/admin/AdminChrome";
import { ProductForm } from "@/components/admin/ProductForm";
import { Pill } from "@/components/ui";
import { createProductAction } from "@/modules/catalog/actions";
import { listPackaging, listStores, listTaxRates } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nová kytice · Admin", robots: { index: false } };

export default async function NewProductPage(props: PageProps<"/admin/nabidka/nova">) {
  const sp = await props.searchParams;
  const full = sp.vse === "1";
  const [stores, taxRates, packaging] = await Promise.all([listStores(), listTaxRates(), listPackaging(true)]);
  return (
    <>
      <AdminTop
        title={full ? "Nový produkt" : "Nová kytice"}
        back={{ href: "/admin/nabidka", label: "Zrušit" }}
        right={full ? undefined : <Pill tone="pink" className="bg-white/20 text-white">⏱ cíl 30 s</Pill>}
      />
      <div className="px-4 pt-3 text-[13px] text-muted">
        {full ? (
          <Link href="/admin/nabidka/nova" className="font-bold text-brand-text">Rychlý režim: jen hotová kytice</Link>
        ) : (
          <>
            Fotka, cena, kusy, prodejna, zveřejnit. <Link href="/admin/nabidka/nova?vse=1" className="font-bold text-brand-text">Jiný typ produktu a všechna pole</Link>
          </>
        )}
      </div>
      <ProductForm action={createProductAction} stores={stores} taxRates={taxRates} packaging={packaging} quick={!full} />
      <AdminNav current="/admin/nabidka/nova" />
    </>
  );
}
