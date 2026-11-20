import type { Metadata } from "next";
import { BottomNav } from "@/components/shop/Chrome";
import { NoDatabase } from "@/components/shop/NoDatabase";
import { ProductCard } from "@/components/shop/ProductCard";
import { SectionTitle } from "@/components/ui";
import { hasDatabase } from "@/db";
import { listOffer } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Doplňky" };

export default async function AddonsPage() {
  if (!hasDatabase()) return <NoDatabase />;
  const addons = (await listOffer()).filter((p) => p.type === "addon");
  return (
    <>
      <SectionTitle hand="k tomu něco navíc">Doplňky</SectionTitle>
      {addons.length === 0 ? (
        <p className="px-4 py-10 text-center text-[14px] text-muted">Doplňky teď nejsou v nabídce.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 py-1.5">
          {addons.map((p) => (
            <ProductCard key={p.id} p={p} wide />
          ))}
        </div>
      )}
      <div className="flex-1" />
      <BottomNav current="/doplnky" />
    </>
  );
}
