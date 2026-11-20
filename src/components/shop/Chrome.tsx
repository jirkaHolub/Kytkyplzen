import Link from "next/link";
import { cx } from "@/components/ui";

export function ShopHeader({ tagline }: { tagline: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-2.5 bg-bg px-4 pb-2 pt-3.5">
      <Link href="/" className="leading-none">
        <span className="font-hand text-[30px] font-bold text-brand">Kytky Plzeň</span>
        <span className="mt-0.5 block font-sans text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{tagline}</span>
      </Link>
      <div className="flex gap-2">
        <Link
          href="/prodejny"
          aria-label="Prodejny"
          className="grid h-12 w-12 place-items-center rounded-full border border-line-2 bg-card"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </Link>
        <a
          href="tel:+420732466589"
          aria-label="Zavolat"
          className="grid h-12 w-12 place-items-center rounded-full border border-line-2 bg-card"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
        </a>
      </div>
    </header>
  );
}

const items = [
  {
    href: "/",
    label: "Nabídka",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[22px] w-[22px]">
        <path d="M12 3c2 4 6 5 6 10a6 6 0 0 1-12 0c0-5 4-6 6-10z" />
        <path d="M12 13v8" />
      </svg>
    ),
  },
  {
    href: "/kytice",
    label: "Kytice",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[22px] w-[22px]">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    href: "/doplnky",
    label: "Doplňky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[22px] w-[22px]">
        <path d="M20 12v9H4v-9" />
        <path d="M2 7h20v5H2zM12 7v14M12 7s-2-5-5-3 5 3 5 3zM12 7s2-5 5-3-5 3-5 3z" />
      </svg>
    ),
  },
  {
    href: "/prodejny",
    label: "Prodejny",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[22px] w-[22px]">
        <path d="M12 22s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
];

export function BottomNav({ current }: { current: string }) {
  return (
    <nav className="safe-bottom sticky bottom-0 z-10 grid grid-cols-4 border-t border-line bg-white px-2 pt-1.5">
      {items.map((it) => {
        const active = it.href === "/" ? current === "/" : current.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cx(
              "flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-extrabold",
              active ? "bg-blush text-brand-text" : "text-muted",
            )}
          >
            {it.icon}
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ShopFooter() {
  return (
    <footer className="px-4 pb-6 pt-5 text-center text-[12px] leading-relaxed text-muted">
      Kytky Plzeň s.r.o. · Sedláčkova 191/9 a Paluba Hamburk, Plzeň
      <br />
      <a href="tel:+420732466589" className="font-bold text-brand-text">
        +420 732 466 589
      </a>{" "}
      ·{" "}
      <a href="https://www.instagram.com/kytky_plzen/" className="font-bold text-brand-text" rel="noreferrer" target="_blank">
        @kytky_plzen
      </a>
      <br />
      <Link href="/admin" className="text-muted">
        Administrace
      </Link>
    </footer>
  );
}
