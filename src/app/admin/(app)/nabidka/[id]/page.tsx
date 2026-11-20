import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminNav, AdminTop } from "@/components/admin/AdminChrome";
import { ProductForm } from "@/components/admin/ProductForm";
import { ConfirmSubmit } from "@/components/admin/forms";
import { Card, CardTitle } from "@/components/ui";
import { adjustStockAction, deleteProductAction, removeImageAction, updateProductAction } from "@/modules/catalog/actions";
import { getProductById, getProductPackagingIds, listPackaging, listStores, listTaxRates } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Upravit produkt · Admin", robots: { index: false } };

export default async function EditProductPage(props: PageProps<"/admin/nabidka/[id]">) {
  const { id } = await props.params;
  const p = await getProductById(id);
  if (!p) notFound();
  const [stores, taxRates, packaging, selected] = await Promise.all([listStores(), listTaxRates(), listPackaging(true), getProductPackagingIds(id)]);
  const stockStores = p.type === "ready_bouquet" && p.storeId ? stores.filter((s) => s.id === p.storeId) : stores;
  return (
    <>
      <AdminTop title="Upravit" subtitle={p.name} back={{ href: "/admin/nabidka", label: "Nabídka" }} />
      {p.images.length > 0 && (
        <div className="px-4 pt-3">
          <Card>
            <CardTitle>Fotky</CardTitle>
            <div className="flex gap-2 overflow-x-auto">
              {p.images.map((im) => (
                <form key={im.id} action={removeImageAction} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line">
                  <Image src={im.url} alt="" fill sizes="80px" className="object-cover" />
                  <input type="hidden" name="imageId" value={im.id} />
                  <input type="hidden" name="productId" value={p.id} />
                  <button type="submit" aria-label="smazat fotku" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-[12px] font-extrabold shadow">
                    ✕
                  </button>
                </form>
              ))}
            </div>
          </Card>
        </div>
      )}
      {p.trackStock && (
        <div className="px-4 pt-3">
          <Card>
            <CardTitle>Sklad</CardTitle>
            {stockStores.map((s) => {
              const row = p.stockByStore.find((r) => r.storeId === s.id);
              return (
                <div key={s.id} className="flex items-center justify-between gap-2 text-[14px] font-bold">
                  <span>
                    {s.shortName}
                    <small className="block text-[12px] font-semibold text-muted">
                      {row ? `${row.qtyOnHand} ks, z toho ${row.qtyReserved} rezervováno` : "bez záznamu"}
                    </small>
                  </span>
                  <div className="flex gap-1.5">
                    {[-1, 1].map((d) => (
                      <form key={d} action={adjustStockAction}>
                        <input type="hidden" name="productId" value={p.id} />
                        <input type="hidden" name="storeId" value={s.id} />
                        <input type="hidden" name="delta" value={d} />
                        <input type="hidden" name="reason" value={d > 0 ? "intake" : "adjust"} />
                        <input type="hidden" name="back" value={`/admin/nabidka/${p.id}`} />
                        <button type="submit" className="h-12 w-12 rounded-xl border-[1.5px] border-line-2 bg-white text-[20px] font-bold text-brand-text">
                          {d > 0 ? "+" : "−"}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
      <ProductForm action={updateProductAction} product={p} stores={stores} taxRates={taxRates} packaging={packaging} packagingSelected={selected} />
      <form action={deleteProductAction} className="px-4 pb-6">
        <input type="hidden" name="id" value={p.id} />
        <ConfirmSubmit variant="ghost" confirmText="Opravdu smazat? Klepněte znovu">Smazat produkt</ConfirmSubmit>
      </form>
      <AdminNav current="/admin/nabidka" />
    </>
  );
}
