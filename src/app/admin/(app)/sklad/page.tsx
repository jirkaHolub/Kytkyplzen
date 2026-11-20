import type { Metadata } from "next";
import { AdminNav, AdminTop, FlashMessages } from "@/components/admin/AdminChrome";
import { ChipLink, Demo, cx } from "@/components/ui";
import { adjustStockAction } from "@/modules/catalog/actions";
import { listProductsAdmin, listStores } from "@/modules/catalog/queries";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sklad · Admin", robots: { index: false } };

export default async function StockPage(props: PageProps<"/admin/sklad">) {
  const sp = await props.searchParams;
  const session = await getSession();
  const stores = await listStores();
  const storeSlug = typeof sp.prodejna === "string" ? sp.prodejna : (stores.find((s) => s.id === session?.storeId)?.slug ?? stores[0]?.slug ?? "");
  const store = stores.find((s) => s.slug === storeSlug) ?? stores[0];
  const products = (await listProductsAdmin()).filter((p) => p.trackStock && (p.type !== "ready_bouquet" || p.storeId === store?.id));
  const back = `/admin/sklad?prodejna=${store?.slug ?? ""}`;
  return (
    <>
      <AdminTop title="Sklad" subtitle={store ? store.shortName : ""} />
      <FlashMessages zprava={typeof sp.zprava === "string" ? sp.zprava : undefined} />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5 pt-3">
        {stores.map((s) => (
          <ChipLink key={s.id} href={`/admin/sklad?prodejna=${s.slug}`} active={store?.id === s.id}>
            {s.shortName}
          </ChipLink>
        ))}
      </div>
      <p className="px-4 pb-2 text-[13px] text-muted">
        „Prodáno“ odečte kus prodaný přímo na prodejně. Plus naskladní další kus. Rezervované kusy drží rozpracované objednávky.
      </p>
      <div className="flex flex-col gap-2 px-4 pb-4">
        {products.length === 0 && <p className="py-8 text-center text-[14px] text-muted">Žádné produkty se sledovaným skladem.</p>}
        {products.map((p) => {
          const row = p.stockByStore.find((r) => r.storeId === store?.id);
          const available = row ? row.qtyOnHand - row.qtyReserved : 0;
          return (
            <div key={p.id} className={cx("flex items-center gap-2 rounded-card border border-line bg-white px-3 py-2", available <= 0 && "opacity-70")}>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[14px] font-extrabold">{p.name}</b>
                <span className="text-[12px] text-muted">
                  {row ? `${row.qtyOnHand} ks` : "0 ks"}
                  {row && row.qtyReserved > 0 ? ` · ${row.qtyReserved} rezervováno` : ""} · volné {Math.max(0, available)}
                </span>
              </div>
              <form action={adjustStockAction}>
                <input type="hidden" name="productId" value={p.id} />
                <input type="hidden" name="storeId" value={store?.id ?? ""} />
                <input type="hidden" name="delta" value="-1" />
                <input type="hidden" name="reason" value="store_sale" />
                <input type="hidden" name="back" value={back} />
                <button type="submit" disabled={available <= 0} className="min-h-[44px] rounded-xl bg-blush px-3 text-[13px] font-extrabold text-brand-text disabled:opacity-40">
                  Prodáno −1
                </button>
              </form>
              <form action={adjustStockAction}>
                <input type="hidden" name="productId" value={p.id} />
                <input type="hidden" name="storeId" value={store?.id ?? ""} />
                <input type="hidden" name="delta" value="1" />
                <input type="hidden" name="reason" value="intake" />
                <input type="hidden" name="back" value={back} />
                <button type="submit" className="h-11 w-11 rounded-xl border-[1.5px] border-line-2 bg-white text-[20px] font-bold text-brand-text">
                  +
                </button>
              </form>
            </div>
          );
        })}
      </div>
      <p className="px-4 pb-3 text-center">
        <Demo>Hotové kytice se při 0 ks automaticky označí jako vyprodané.</Demo>
      </p>
      <div className="flex-1" />
      <AdminNav current="/admin/sklad" />
    </>
  );
}
