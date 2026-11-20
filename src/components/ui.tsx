import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "ok";

const btnBase =
  "inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[16px] px-4 text-[16px] font-extrabold transition-colors disabled:opacity-50";
const btnVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  secondary: "bg-blush text-brand-text hover:bg-blush-2",
  ghost: "border-[1.5px] border-line-2 bg-white text-ink hover:bg-blush",
  danger: "bg-danger-bg text-danger hover:bg-danger hover:text-white",
  ok: "bg-ok text-white",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: "md" | "sm" }) {
  return (
    <button
      className={cx(btnBase, btnVariants[variant], size === "sm" && "min-h-[44px] rounded-[12px] px-3 text-[14px]", className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: "md" | "sm" }) {
  return (
    <Link
      className={cx(btnBase, btnVariants[variant], size === "sm" && "min-h-[44px] rounded-[12px] px-3 text-[14px]", className)}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("flex flex-col gap-3 rounded-card border border-line bg-card p-4", className)}>{children}</div>;
}

export function CardTitle({ children, num }: { children: ReactNode; num?: number | string }) {
  return (
    <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
      {num !== undefined && (
        <span className="grid h-6 w-6 place-items-center rounded-full bg-blush-2 text-[12px] text-brand-text">{num}</span>
      )}
      {children}
    </h3>
  );
}

export function Pill({
  tone = "gray",
  children,
  className,
}: {
  tone?: "ok" | "warn" | "info" | "pink" | "gray" | "danger";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    ok: "bg-ok-bg text-ok",
    warn: "bg-warn-bg text-warn",
    info: "bg-info-bg text-info",
    pink: "bg-blush-2 text-brand-text",
    gray: "bg-[#F1EBEE] text-muted",
    danger: "bg-danger-bg text-danger",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-extrabold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function ChipLink({ active, href, children }: { active?: boolean; href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cx(
        "inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-[14px] font-bold",
        active ? "border-brand bg-brand text-white" : "border-line-2 bg-card text-ink",
      )}
    >
      {children}
    </Link>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-extrabold uppercase tracking-[0.06em] text-muted">{label}</span>
      {children}
      {hint && <span className="text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "min-h-[48px] w-full rounded-field border-[1.5px] border-line-2 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-[#B5A5AE] focus:border-brand focus:outline-none";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={cx(inputClass, props.className)} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={cx(inputClass, "min-h-[92px] resize-none", props.className)} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={cx(inputClass, "appearance-none", props.className)} />;
}

export function SectionTitle({ children, hand, action }: { children: ReactNode; hand?: string; action?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2.5 px-4 pb-1.5 pt-3.5">
      <h2 className="text-[19px] font-extrabold">
        {children} {hand && <span className="font-hand text-[24px] font-medium text-brand-text">{hand}</span>}
      </h2>
      {action}
    </div>
  );
}

export function Hint({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("text-[12px] text-muted", className)}>{children}</p>;
}

export function Demo({ children }: { children: ReactNode }) {
  return <span className="inline-block rounded-lg bg-[#F7F1F4] px-2.5 py-1 text-[11px] text-muted">{children}</span>;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "ok" | "warn" | "danger"; children: ReactNode }) {
  const tones = {
    info: "bg-info-bg text-info",
    ok: "bg-ok-bg text-ok",
    warn: "bg-warn-bg text-warn",
    danger: "bg-danger-bg text-danger",
  };
  return <div className={cx("rounded-field px-3 py-2.5 text-[13px] font-bold", tones[tone])}>{children}</div>;
}

export { cx };
