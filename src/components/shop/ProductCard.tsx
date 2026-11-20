import Image from "next/image";
import Link from "next/link";
import type { ProductWithDetails } from "@/modules/catalog/queries";
import { formatCzk } from "@/lib/money";
import { formatDayShort } from "@/lib/dates";
import { cx } from "@/components/ui";

export function productHref(p: { slug: string; type: string }) {
  return p.type === "addon" ? `/doplnky/${p.slug}` : `/kytice/${p.slug}`;
}

export function priceLabel(p: ProductWithDetails) {
  if (p.type === "stem") return `od ${formatCzk(p.priceCents)} / ${p.unitLabel ?? "ks"}`;
  if (p.type === "custom_tier" && p.customMinCents) return `od ${formatCzk(p.customMinCents)}`;
  if (p.type === "premium_preorder" && p.slug.startsWith("svatebni")) return `od ${formatCzk(p.priceCents)}`;
  return formatCzk(p.priceCents);
}

export function metaLabel(p: ProductWithDetails) {
  const a = p.availability;
  if (p.type === "ready_bouquet") {
    const store = p.store?.shortName ?? "";
    if (a.badge === "sold_out") return store;
    const n = a.totalAvailable;
    return `${store} · ${n === 1 ? "poslední kus" : `${n} ks`}`;
  }
  if (p.type === "premium_preorder") return `nejdříve ${formatDayShort(a.earliestDate)}`;
  if (p.type === "custom_tier") return "barvy a styl zadáte v objednávce";
  if (p.type === "stem") return p.description?.split(".")[0]?.slice(0, 40) ?? "";
  return "";
}

export function ProductCard({ p, wide }: { p: ProductWithDetails; wide?: boolean }) {
  const img = p.images[0];
  const a = p.availability;
  const soldOut = a.badge === "sold_out";
  return (
    <Link
      href={productHref(p)}
      className={cx("relative flex flex-col overflow-hidden rounded-card border border-line bg-card", soldOut && "opacity-80")}
    >
      {a.badge === "last_one" && (
        <span className="absolute left-2.5 top-2.5 z-[1] rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-warn shadow">
          Poslední kus
        </span>
      )}
      {soldOut && (
        <span className="absolute left-2.5 top-2.5 z-[1] rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-muted shadow">
          Vyprodáno
        </span>
      )}
      <div className={cx("relative overflow-hidden bg-blush", wide ? "aspect-[4/3]" : "aspect-[4/5]", soldOut && "grayscale-[.6]")}>
        {img ? (
          <Image src={img.url} alt={img.alt ?? p.name} fill sizes="(max-width: 640px) 50vw, 300px" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center font-hand text-[26px] text-brand-text">{p.type === "addon" ? "doplněk" : "kytice"}</div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-3 pb-3 pt-2.5">
        <span className="text-[14px] font-extrabold">{p.name}</span>
        <span className="text-[16px] font-extrabold text-brand-text">{priceLabel(p)}</span>
        <span className="text-[12px] text-muted">{metaLabel(p)}</span>
      </div>
    </Link>
  );
}
