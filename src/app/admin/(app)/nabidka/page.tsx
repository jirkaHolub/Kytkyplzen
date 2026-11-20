import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AdminNav, AdminTop, FlashMessages } from "@/components/admin/AdminChrome";
import { ChipLink, Demo, Pill, cx } from "@/components/ui";
import { formatDateTimePrague } from "@/lib/dates";
import { formatCzk } from "@/lib/money";
import { adjustStockAction, setProductStatusAction } from "@/modules/catalog/actions";
import { listProductsAdmin, listStores, type ProductWithDetails } from "@/modules/catalog/queries";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nabídka · Admin", robots: { index: false } };

const typeChips = [
  { key: "", label: "Vše" },
  { key: "ready_bouquet", label: "Hotové" },
  { key: "premium_preorder", label: "Prémiové" },
  { key: "custom_tier", label: "Na míru" },
  { key: "stem", label: "Na kusy" },
  { key: "addon", label: "Doplňky" },
];

function statusPill(p: ProductWithDetails) {
  if (p.status === "draft") return <Pill tone="gray">Koncept</Pill>;
  if (p.status === "hidden") return <Pill tone="gray">Skryto</Pill>;
  if (p.status === "sold_out" || p.availability.badge === "sold_out") return <Pill tone="warn">Vyprodáno</Pill>;
  if (p.publishAt && p.publishAt > new Date()) return <Pill tone="info">Od {formatDateTimePrague(p.publishAt)}</Pill>;
  if (p.unpublishAt && p.unpublishAt <= new Date()) return <Pill tone="gray">Staženo</Pill>;
  return <Pill tone="ok">V nabídce</Pill>;
}

export default async function AdminOfferPage(props: PageProps<"/admin/nabidka">) {
  const sp = await props.searchParams;
  const session = await getSession();
  const typ = typeof sp.typ === "string" ? sp.typ : "";
  const storeSlug = typeof sp.prodejna === "string" ? sp.prodejna : "";
  const stores = await listStores();
  const store = stores.find((s) => s.slug === storeSlug) ?? null;
  const all = await listProductsAdmin();
  const list = all.filter((p) => (!typ || p.type === typ) && (!store || p.type !== "ready_bouquet" || p.storeId === store.id));
  const q = (t: string, s: string) => `/admin/nabidka?${new URLSearchParams({ ...(t ? { typ: t } : {}), ...(s ? { prodejna: s } : {}) })}`;
  const back = q(typ, storeSlug);
  const inOffer = all.filter((p) => p.type === "ready_bouquet" && p.availability.purchasable).length;

  return (
    <>
      <AdminTop title="Nabídka" subtitle={`${inOffer} hotových kytic v prodeji · ${session?.name ?? ""}`} right={<Link href="/" className="text-[13px] font-bold underline">Web</Link>} />
      <FlashMessages zprava={typeof sp.zprava === "string" ? sp.zprava : undefined} chyba={typeof sp.chyba === "string" ? sp.chyba : undefined} />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 pt-3">
        {typeChips.map((t) => (
          <ChipLink key={t.key} href={q(t.key, storeSlug)} active={typ === t.key}>
            {t.label}
          </ChipLink>
        ))}
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2.5 pt-1">
        <ChipLink href={q(typ, "")} active={!store}>
          Obě prodejny
        </ChipLink>
        {stores.map((s) => (
          <ChipLink key={s.id} href={q(typ, s.slug)} active={store?.id === s.id}>
            {s.shortName}
          </ChipLink>
        ))}
      </div>

      {list.length === 0 && <p className="px-4 py-8 text-center text-[14px] text-muted">Nic tu není. Přidejte kytici tlačítkem + dole.</p>}

      <div className="flex flex-col gap-2.5 px-4 pb-4">
        {list.map((p) => {
          const img = p.images[0];
          const stockRow = p.storeId ? p.stockByStore.find((s) => s.storeId === p.storeId) : null;
          const available = p.availability.totalAvailable;
          return (
            <div key={p.id} className={cx("overflow-hidden rounded-card border border-line bg-white", (p.status === "hidden" || p.status === "draft") && "opacity-75")}>
              <Link href={`/admin/nabidka/${p.id}`} className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blush">
                  {img && <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[14px] font-extrabold">{p.name}</b>
                  <span className="block truncate text-[12px] text-muted">
                    {formatCzk(p.priceCents)}
                    {p.store ? ` · ${p.store.shortName}` : ""}
                    {p.trackStock && p.type === "ready_bouquet" ? ` · ${Number.isFinite(available) ? available : "∞"} ks` : ""}
                    {stockRow && stockRow.qtyReserved > 0 ? ` (${stockRow.qtyReserved} rezervováno)` : ""}
                    {p.leadTimeDays > 0 ? ` · ${p.leadTimeDays} dní předem` : ""}
                  </span>
                </div>
                {statusPill(p)}
              </Link>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5 px-2.5 pb-2.5">
                {p.type === "ready_bouquet" && p.storeId ? (
                  <form action={adjustStockAction}>
                    <input type="hidden" name="productId" value={p.id} />
                    <input type="hidden" name="storeId" value={p.storeId} />
                    <input type="hidden" name="delta" value="-1" />
                    <input type="hidden" name="reason" value="store_sale" />
                    <input type="hidden" name="back" value={back} />
                    <button type="submit" disabled={!stockRow || stockRow.qtyOnHand - stockRow.qtyReserved <= 0} className="min-h-[44px] w-full rounded-xl bg-blush px-2 text-[13px] font-extrabold text-brand-text disabled:opacity-40">
                      Prodáno na prodejně −1
                    </button>
                  </form>
                ) : (
                  <form action={setProductStatusAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value={p.status === "sold_out" ? "published" : "sold_out"} />
                    <input type="hidden" name="back" value={back} />
                    <button type="submit" className="min-h-[44px] w-full rounded-xl bg-blush px-2 text-[13px] font-extrabold text-brand-text">
                      {p.status === "sold_out" ? "Zase v prodeji" : "Vyprodáno"}
                    </button>
                  </form>
                )}
                <form action={setProductStatusAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value={p.status === "hidden" || p.status === "draft" ? "published" : "hidden"} />
                  <input type="hidden" name="back" value={back} />
                  <button type="submit" className="min-h-[44px] w-full rounded-xl bg-brand px-2 text-[13px] font-extrabold text-white">
                    {p.status === "hidden" || p.status === "draft" ? "Zveřejnit" : "Skrýt"}
                  </button>
                </form>
                <Link href={`/admin/nabidka/${p.id}`} aria-label="Upravit" className="grid min-h-[44px] w-12 place-items-center rounded-xl border-[1.5px] border-line-2 bg-white text-[16px]">
                  ✎
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <p className="px-4 pb-3 text-center">
        <Demo>Změny se na webu projeví okamžitě.</Demo>
      </p>
      <div className="flex-1" />
      <AdminNav current="/admin/nabidka" />
    </>
  );
}
