import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/components/ui";

export function AdminTop({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 bg-brand px-4 pb-3 pt-3.5 text-white">
      <div className="flex items-center justify-between gap-3">
        {back ? (
          <Link href={back.href} className="inline-flex min-h-[48px] items-center gap-1 font-bold">
            ‹ {back.label}
          </Link>
        ) : (
          <span className="w-12" />
        )}
        <div className="text-center">
          <h1 className="text-[20px] font-extrabold">{title}</h1>
          {subtitle && <div className="text-[13px] opacity-90">{subtitle}</div>}
        </div>
        <div className="flex min-w-12 justify-end">{right}</div>
      </div>
    </header>
  );
}

const items = [
  { href: "/admin/nabidka", label: "Nabídka", icon: "🌷" },
  { href: "/admin/sklad", label: "Sklad", icon: "📦" },
  { href: "/admin/nabidka/nova", label: "Nová kytice", plus: true },
  { href: "/admin/nastaveni", label: "Nastavení", icon: "⚙️" },
  { href: "/admin/vice", label: "Více", icon: "⋯" },
];

export function AdminNav({ current }: { current: string }) {
  return (
    <nav className="safe-bottom sticky bottom-0 z-10 grid grid-cols-5 border-t border-line bg-white px-1.5 pt-1.5">
      {items.map((it) => {
        const active = it.plus ? current.startsWith("/admin/nabidka/nova") : current.startsWith(it.href) && !(it.href === "/admin/nabidka" && current.startsWith("/admin/nabidka/nova"));
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cx(
              "flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-extrabold",
              active && !it.plus ? "bg-blush text-brand-text" : "text-muted",
            )}
          >
            {it.plus ? (
              <span className="-mt-4 grid h-10 w-10 place-items-center rounded-full bg-brand text-[24px] leading-none text-white shadow-[0_6px_14px_rgba(224,108,159,.45)]">+</span>
            ) : (
              <span className="text-[20px] leading-none">{it.icon}</span>
            )}
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function FlashMessages({ zprava, chyba }: { zprava?: string; chyba?: string }) {
  if (!zprava && !chyba) return null;
  return (
    <div className="px-4 pt-3">
      {zprava && <div className="rounded-field bg-ok-bg px-3 py-2.5 text-[13px] font-bold text-ok">{zprava}</div>}
      {chyba && <div className="rounded-field bg-danger-bg px-3 py-2.5 text-[13px] font-bold text-danger">{chyba}</div>}
    </div>
  );
}
