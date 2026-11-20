"use client";

import { useFormStatus } from "react-dom";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui";

export function SubmitButton({ children, pendingText = "Ukládám…", ...props }: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}

/** Tlačítko, které vyžaduje druhé klepnutí pro potvrzení (bez systémového confirm dialogu). */
export function ConfirmSubmit({ children, confirmText = "Opravdu? Klepněte znovu", ...props }: ComponentProps<typeof Button> & { confirmText?: string }) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();
  if (!armed) {
    return (
      <Button
        type="button"
        onClick={() => {
          setArmed(true);
          setTimeout(() => setArmed(false), 4000);
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }
  return (
    <Button type="submit" disabled={pending} {...props} variant="danger">
      {pending ? "…" : confirmText}
    </Button>
  );
}

/** Přepínač se skrytým inputem, posílá "on"/"off". */
export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <label className="flex min-h-[48px] cursor-pointer items-center justify-between gap-3 text-[14px] font-bold">
      <span>
        {label}
        {hint && <small className="block text-[12px] font-semibold text-muted">{hint}</small>}
      </span>
      <input type="hidden" name={name} value={on ? "on" : "off"} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn(!on)}
        className={`relative h-[30px] w-[50px] shrink-0 rounded-full transition-colors ${on ? "bg-brand" : "bg-[#E8DCE3]"}`}
      >
        <span className={`absolute top-[3px] h-6 w-6 rounded-full bg-white shadow transition-[left] ${on ? "left-[23px]" : "left-[3px]"}`} />
      </button>
    </label>
  );
}

export function Segmented({
  name,
  options,
  defaultValue,
  onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  onChange?: (v: string) => void;
}) {
  const [v, setV] = useState(defaultValue ?? options[0]?.value ?? "");
  return (
    <div className="grid gap-1 rounded-field bg-blush p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      <input type="hidden" name={name} value={v} />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => {
            setV(o.value);
            onChange?.(o.value);
          }}
          className={`min-h-[44px] rounded-[11px] px-2 text-[14px] font-extrabold ${v === o.value ? "bg-white text-ink shadow-sm" : "text-brand-text"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ name, defaultValue = 1, min = 0, max = 999 }: { name: string; defaultValue?: number; min?: number; max?: number }) {
  const [v, setV] = useState(defaultValue);
  return (
    <div className="inline-flex items-center overflow-hidden rounded-field border-[1.5px] border-line-2 bg-white">
      <input type="hidden" name={name} value={v} />
      <button type="button" aria-label="méně" className="h-12 w-12 text-[22px] font-bold text-brand-text" onClick={() => setV(Math.max(min, v - 1))}>
        −
      </button>
      <span className="min-w-10 text-center text-[18px] font-extrabold">{v}</span>
      <button type="button" aria-label="více" className="h-12 w-12 text-[22px] font-bold text-brand-text" onClick={() => setV(Math.min(max, v + 1))}>
        +
      </button>
    </div>
  );
}
