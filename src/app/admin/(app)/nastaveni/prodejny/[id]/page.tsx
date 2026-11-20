import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { AdminNav, AdminTop, FlashMessages } from "@/components/admin/AdminChrome";
import { SubmitButton } from "@/components/admin/forms";
import { Card, CardTitle, Field, Input } from "@/components/ui";
import { getDb } from "@/db";
import { stores } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { WEEKDAYS_CS } from "@/lib/dates";
import { updateStoreAction } from "@/modules/catalog/actions";
import { getStoreHours } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prodejna · Admin", robots: { index: false } };

export default async function StoreEditPage(props: PageProps<"/admin/nastaveni/prodejny/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const session = await getSession();
  const isOwner = session?.role === "owner";
  const db = await getDb();
  const [store] = await db.select().from(stores).where(eq(stores.id, id));
  if (!store) notFound();
  const hours = await getStoreHours(id);
  const byDay = new Map(hours.map((h) => [h.weekday, h]));
  return (
    <>
      <AdminTop title={store.shortName} back={{ href: "/admin/nastaveni", label: "Nastavení" }} />
      <FlashMessages zprava={typeof sp.zprava === "string" ? sp.zprava : undefined} />
      <form action={updateStoreAction} className="flex flex-col gap-3 px-4 py-3">
        <input type="hidden" name="id" value={store.id} />
        <fieldset disabled={!isOwner} className="flex flex-col gap-3">
          <Card>
            <CardTitle>Údaje prodejny</CardTitle>
            <Field label="Název"><Input name="name" defaultValue={store.name} required /></Field>
            <Field label="Krátký název (na webu)"><Input name="shortName" defaultValue={store.shortName} required /></Field>
            <Field label="Adresa"><Input name="addressLine" defaultValue={store.addressLine} required /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Město"><Input name="city" defaultValue={store.city} /></Field>
              <Field label="PSČ"><Input name="zip" defaultValue={store.zip} /></Field>
            </div>
            <Field label="Telefon"><Input name="phone" defaultValue={store.phone ?? ""} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Zeměpisná šířka" hint="pro výpočet dopravy"><Input name="lat" defaultValue={store.lat ?? ""} inputMode="decimal" /></Field>
              <Field label="Zeměpisná délka"><Input name="lng" defaultValue={store.lng ?? ""} inputMode="decimal" /></Field>
            </div>
            <label className="flex min-h-[44px] items-center gap-3 text-[14px] font-bold"><input type="checkbox" name="delivers" defaultChecked={store.delivers} className="h-5 w-5 accent-brand" />Rozváží objednávky</label>
            <label className="flex min-h-[44px] items-center gap-3 text-[14px] font-bold"><input type="checkbox" name="pickupEnabled" defaultChecked={store.pickupEnabled} className="h-5 w-5 accent-brand" />Osobní odběr</label>
            <label className="flex min-h-[44px] items-center gap-3 text-[14px] font-bold"><input type="checkbox" name="active" defaultChecked={store.active} className="h-5 w-5 accent-brand" />Prodejna je aktivní</label>
          </Card>
          <Card>
            <CardTitle>Otevírací doba</CardTitle>
            {WEEKDAYS_CS.map((label, d) => {
              const h = byDay.get(d);
              return (
                <div key={d} className="grid grid-cols-[80px_1fr_1fr_auto] items-center gap-2 text-[13px] font-bold">
                  <span className="capitalize">{label}</span>
                  <Input name={`opens_${d}`} type="time" defaultValue={h?.opens ?? "08:00"} aria-label="otevírá" />
                  <Input name={`closes_${d}`} type="time" defaultValue={h?.closes ?? "18:00"} aria-label="zavírá" />
                  <label className="flex items-center gap-1 text-[12px]"><input type="checkbox" name={`closed_${d}`} defaultChecked={h?.closed ?? false} className="h-5 w-5 accent-brand" />zavřeno</label>
                </div>
              );
            })}
          </Card>
          {isOwner && <SubmitButton>Uložit prodejnu</SubmitButton>}
        </fieldset>
      </form>
      <div className="flex-1" />
      <AdminNav current="/admin/nastaveni" />
    </>
  );
}
