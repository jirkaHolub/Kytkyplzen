"use client";

import { useActionState, useMemo, useState, useSyncExternalStore } from "react";
import type { PackagingOption, Store, TaxRate } from "@/db/schema";
import type { ProductWithDetails } from "@/modules/catalog/queries";
import type { ActionState } from "@/modules/admin/actions";
import { Card, CardTitle, Field, Hint, Input, Notice, Select, Textarea } from "@/components/ui";
import { PhotoUpload } from "./PhotoUpload";
import { Segmented, Stepper, SubmitButton, Toggle } from "./forms";
import { toDateTimeLocal } from "@/lib/dates";

const LAST_KEY = "kp.lastBouquet";

type Last = { price?: string; storeId?: string; qty?: number };

function readLast(): string {
  try {
    return localStorage.getItem(LAST_KEY) ?? "";
  } catch {
    return "";
  }
}
function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

const typeOptions = [
  { value: "ready_bouquet", label: "Hotová kytice" },
  { value: "premium_preorder", label: "Prémiová" },
  { value: "custom_tier", label: "Na míru" },
  { value: "stem", label: "Na kusy" },
  { value: "addon", label: "Doplněk" },
];

export function ProductForm({
  action,
  product,
  stores,
  taxRates,
  packaging,
  packagingSelected = [],
  quick,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  product?: ProductWithDetails;
  stores: Store[];
  taxRates: TaxRate[];
  packaging: PackagingOption[];
  packagingSelected?: string[];
  /** rychlý režim „nová kytice z mobilu“ */
  quick?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  const [type, setType] = useState<string>(product?.type ?? "ready_bouquet");
  const [publishNow, setPublishNow] = useState(!product?.publishAt);
  const isReady = type === "ready_bouquet";

  // poslední použité hodnoty z localStorage (jen u nové kytice); na serveru prázdné
  const lastRaw = useSyncExternalStore(subscribeStorage, () => (product ? "" : readLast()), () => "");
  const last = useMemo<Last>(() => {
    try {
      return lastRaw ? (JSON.parse(lastRaw) as Last) : {};
    } catch {
      return {};
    }
  }, [lastRaw]);

  function rememberOnSubmit(fd: FormData) {
    try {
      localStorage.setItem(
        LAST_KEY,
        JSON.stringify({ price: String(fd.get("price") ?? ""), storeId: String(fd.get("storeId") ?? ""), qty: Number(fd.get("qty") ?? 1) }),
      );
    } catch {}
  }

  const defaultTax = taxRates.find((t) => t.isDefault)?.id;

  return (
    <form
      action={(fd) => {
        rememberOnSubmit(fd);
        return formAction(fd);
      }}
      className="flex flex-col gap-3 px-4 pb-4 pt-3"
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      {state?.error && <Notice tone="danger">{state.error}</Notice>}

      <PhotoUpload initial={product?.images.map((i) => i.url) ?? []} />

      {!quick && (
        <Field label="Typ produktu">
          <Segmented name="type" options={typeOptions} defaultValue={type} onChange={setType} />
        </Field>
      )}
      {quick && <input type="hidden" name="type" value={type} />}

      <Card key={lastRaw}>
        <div className="flex items-end gap-3">
          <Field label="Cena">
            <div className="flex items-center gap-2 rounded-field border-[1.5px] border-line-2 bg-white px-3.5">
              <input
                name="price"
                inputMode="decimal"
                required
                defaultValue={product ? String(product.priceCents / 100) : (last.price ?? "")}
                placeholder="0"
                className="min-h-[64px] w-full bg-transparent text-right text-[34px] font-extrabold tracking-[-0.02em] outline-none"
              />
              <span className="text-[18px] text-muted">Kč</span>
            </div>
          </Field>
          {isReady && !product && (
            <Field label="Kusů">
              <Stepper name="qty" defaultValue={last.qty ?? 1} min={0} />
            </Field>
          )}
        </div>
        {isReady && (
          <Field label="Prodejna">
            <Segmented
              name="storeId"
              options={stores.map((s) => ({ value: s.id, label: s.shortName }))}
              defaultValue={product?.storeId ?? last.storeId ?? stores[0]?.id}
            />
          </Field>
        )}
        <Field label={isReady ? "Název (nepovinné, jinak „Kytice“ s pořadovým číslem)" : "Název"}>
          <Input name="name" defaultValue={product?.name ?? ""} placeholder={isReady ? "např. Pudrová hortenzie" : "Název produktu"} required={!isReady} />
        </Field>
        {type === "custom_tier" && (
          <Field label="Minimální částka u vlastní částky (nepovinné)" hint="Vyplňte jen u hladiny „vlastní částka“.">
            <Input name="customMin" inputMode="decimal" defaultValue={product?.customMinCents ? String(product.customMinCents / 100) : ""} placeholder="např. 600" />
          </Field>
        )}
        {type === "stem" && (
          <Field label="Jednotka">
            <Input name="unitLabel" defaultValue={product?.unitLabel ?? "ks"} />
          </Field>
        )}
        {type === "premium_preorder" && (
          <Field label="Minimální předstih objednávky (dní)">
            <Input name="leadTimeDays" type="number" min={1} max={60} defaultValue={product?.leadTimeDays || 5} />
          </Field>
        )}
        {!quick && type !== "premium_preorder" && (
          <Field label="Předstih objednávky (dní, 0 = lze dnes)">
            <Input name="leadTimeDays" type="number" min={0} max={60} defaultValue={product?.leadTimeDays ?? 0} />
          </Field>
        )}
      </Card>

      {!quick && (
        <Card>
          <CardTitle>Popis a DPH</CardTitle>
          <Field label="Popis">
            <Textarea name="description" defaultValue={product?.description ?? ""} placeholder="Z čeho je kytice, velikost, pro koho se hodí…" />
          </Field>
          <Field label="Sazba DPH">
            <Select name="taxRateId" defaultValue={product?.taxRateId ?? defaultTax ?? ""}>
              {taxRates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          {!isReady && <Toggle name="trackStock" label="Sledovat sklad po prodejnách" defaultChecked={product?.trackStock ?? false} hint="U kytic na míru, květin na kusy a doplňků obvykle ne." />}
          <Toggle name="allowCardMessage" label="Nabídnout vzkaz na kartičku" defaultChecked={product?.allowCardMessage ?? true} />
        </Card>
      )}
      {quick && defaultTax && <input type="hidden" name="taxRateId" value={defaultTax} />}

      {packaging.length > 0 && !quick && (
        <Card>
          <CardTitle>Dostupné balení</CardTitle>
          <Hint>Nic nezaškrtnuto = všechna aktivní balení.</Hint>
          {packaging.map((p) => (
            <label key={p.id} className="flex min-h-[44px] items-center gap-3 text-[14px] font-bold">
              <input type="checkbox" name="packagingId" value={p.id} defaultChecked={packagingSelected.includes(p.id)} className="h-5 w-5 accent-brand" />
              {p.name}
              <span className="ml-auto text-muted">{p.surchargeCents ? `+${p.surchargeCents / 100} Kč` : "v ceně"}</span>
            </label>
          ))}
        </Card>
      )}

      <Card>
        {product ? (
          <Field label="Stav">
            <Select name="status" defaultValue={product.status}>
              <option value="published">V nabídce</option>
              <option value="sold_out">Vyprodáno</option>
              <option value="hidden">Skryto</option>
              <option value="draft">Koncept</option>
            </Select>
          </Field>
        ) : (
          <Toggle name="publishNow" label="Zveřejnit hned" defaultChecked={publishNow} />
        )}
        <div className="grid grid-cols-2 gap-2">
          <Field label="Zveřejnit od" hint="nepovinné">
            <Input
              name="publishAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(product?.publishAt)}
              onChange={(e) => setPublishNow(!e.target.value)}
            />
          </Field>
          <Field label="Stáhnout z nabídky" hint="nepovinné">
            <Input name="unpublishAt" type="datetime-local" defaultValue={toDateTimeLocal(product?.unpublishAt)} />
          </Field>
        </div>
        {!product && last.price && <Hint>Naposledy: {last.price} Kč · {last.qty ?? 1} ks. Hodnoty jsou předvyplněné.</Hint>}
      </Card>

      <div className="safe-bottom sticky bottom-[64px] bg-gradient-to-b from-transparent to-bg pt-2">
        <SubmitButton pendingText="Ukládám…">{product ? "Uložit změny" : "Zveřejnit ✓"}</SubmitButton>
      </div>
    </form>
  );
}
