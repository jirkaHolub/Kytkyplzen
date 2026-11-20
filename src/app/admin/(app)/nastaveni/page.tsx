import Link from "next/link";
import type { Metadata } from "next";
import { AdminNav, AdminTop, FlashMessages } from "@/components/admin/AdminChrome";
import { SubmitButton } from "@/components/admin/forms";
import { Card, CardTitle, Field, Hint, Input, Select, Textarea } from "@/components/ui";
import { getDb } from "@/db";
import { adminUsers } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { formatCzk } from "@/lib/money";
import { createAdminUserAction, migrateAction, toggleAdminUserAction } from "@/modules/admin/actions";
import { deletePackagingAction, savePackagingAction, saveTaxRateAction, saveTextsAction } from "@/modules/catalog/actions";
import { getSetting, listAllStores, listPackaging, listTaxRates } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nastavení · Admin", robots: { index: false } };

export default async function SettingsPage(props: PageProps<"/admin/nastaveni">) {
  const sp = await props.searchParams;
  const session = await getSession();
  const isOwner = session?.role === "owner";
  const [stores, packaging, taxRates, infoStrip, tagline] = await Promise.all([
    listAllStores(),
    listPackaging(false),
    listTaxRates(),
    getSetting("texts.infoStrip", ""),
    getSetting("texts.tagline", "Květiny až ke dveřím"),
  ]);
  const db = await getDb();
  const users = await db.select().from(adminUsers);

  return (
    <>
      <AdminTop title="Nastavení" subtitle={isOwner ? "majitelka" : "floristka: jen ke čtení"} />
      <FlashMessages zprava={typeof sp.zprava === "string" ? sp.zprava : undefined} chyba={typeof sp.chyba === "string" ? sp.chyba : undefined} />
      <div className="flex flex-col gap-3 px-4 py-3">
        <Card>
          <CardTitle>Prodejny a otevírací doba</CardTitle>
          {stores.map((s) => (
            <Link key={s.id} href={`/admin/nastaveni/prodejny/${s.id}`} className="flex min-h-[48px] items-center justify-between gap-2 rounded-field border border-line px-3 text-[14px] font-bold">
              <span>
                {s.shortName}
                <small className="block text-[12px] font-semibold text-muted">{s.addressLine}{s.active ? "" : " · neaktivní"}</small>
              </span>
              <span className="text-brand-text">Upravit ›</span>
            </Link>
          ))}
        </Card>

        <Card>
          <CardTitle>Texty na webu</CardTitle>
          <form action={saveTextsAction} className="flex flex-col gap-3">
            <Field label="Podtitul pod logem">
              <Input name="texts.tagline" defaultValue={tagline} disabled={!isOwner} />
            </Field>
            <Field label="Informační lišta na úvodu" hint="Prázdné = lišta se nezobrazí.">
              <Textarea name="texts.infoStrip" defaultValue={infoStrip} disabled={!isOwner} />
            </Field>
            {isOwner && <SubmitButton size="sm">Uložit texty</SubmitButton>}
          </form>
        </Card>

        <Card>
          <CardTitle>Balení</CardTitle>
          {packaging.map((p) => (
            <form key={p.id} action={savePackagingAction} className="flex flex-col gap-2 rounded-field border border-line p-3">
              <input type="hidden" name="id" value={p.id} />
              <div className="grid grid-cols-[1fr_90px] gap-2">
                <Input name="name" defaultValue={p.name} disabled={!isOwner} aria-label="název" />
                <Input name="surcharge" defaultValue={String(p.surchargeCents / 100)} inputMode="decimal" disabled={!isOwner} aria-label="příplatek Kč" />
              </div>
              <Input name="description" defaultValue={p.description ?? ""} placeholder="popis (nepovinné)" disabled={!isOwner} />
              <div className="flex flex-wrap items-center gap-3 text-[13px] font-bold">
                <label className="flex items-center gap-2"><input type="checkbox" name="isDefault" defaultChecked={p.isDefault} disabled={!isOwner} className="h-5 w-5 accent-brand" />výchozí</label>
                <label className="flex items-center gap-2"><input type="hidden" name="active" value={p.active ? "on" : "off"} />{p.active ? "aktivní" : "neaktivní"}</label>
                <span className="ml-auto text-muted">{p.surchargeCents ? `+${formatCzk(p.surchargeCents)}` : "v ceně"}</span>
              </div>
              {isOwner && (
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <SubmitButton size="sm" variant="secondary">Uložit</SubmitButton>
                  {p.active && (
                    <button formAction={deletePackagingAction} className="min-h-[44px] rounded-xl px-3 text-[13px] font-extrabold text-danger">Vypnout</button>
                  )}
                </div>
              )}
            </form>
          ))}
          {isOwner && (
            <form action={savePackagingAction} className="flex flex-col gap-2 rounded-field border border-dashed border-line-2 p-3">
              <Hint>Nové balení</Hint>
              <div className="grid grid-cols-[1fr_90px] gap-2">
                <Input name="name" placeholder="název" required />
                <Input name="surcharge" placeholder="Kč" inputMode="decimal" defaultValue="0" />
              </div>
              <SubmitButton size="sm" variant="secondary">Přidat balení</SubmitButton>
            </form>
          )}
        </Card>

        <Card>
          <CardTitle>Sazby DPH</CardTitle>
          <Hint>Výchozí sazba se předvyplní u nového produktu. Sazby potvrďte s účetní.</Hint>
          {taxRates.map((t) => (
            <form key={t.id} action={saveTaxRateAction} className="grid grid-cols-[1fr_70px_auto_auto] items-center gap-2">
              <input type="hidden" name="id" value={t.id} />
              <Input name="name" defaultValue={t.name} disabled={!isOwner} aria-label="název" />
              <Input name="percent" defaultValue={String(t.rateBp / 100)} inputMode="decimal" disabled={!isOwner} aria-label="procent" />
              <label className="flex items-center gap-1 text-[12px] font-bold"><input type="checkbox" name="isDefault" defaultChecked={t.isDefault} disabled={!isOwner} className="h-5 w-5 accent-brand" />výchozí</label>
              {isOwner ? <button className="min-h-[44px] rounded-xl bg-blush px-3 text-[13px] font-extrabold text-brand-text">Uložit</button> : <span />}
            </form>
          ))}
          {isOwner && (
            <form action={saveTaxRateAction} className="grid grid-cols-[1fr_70px_auto] items-center gap-2">
              <Input name="name" placeholder="nová sazba" required />
              <Input name="percent" placeholder="%" inputMode="decimal" required />
              <button className="min-h-[44px] rounded-xl bg-blush px-3 text-[13px] font-extrabold text-brand-text">Přidat</button>
            </form>
          )}
        </Card>

        <Card>
          <CardTitle>Uživatelé adminu</CardTitle>
          {users.map((u) => (
            <form key={u.id} action={toggleAdminUserAction} className="flex items-center justify-between gap-2 text-[14px]">
              <input type="hidden" name="id" value={u.id} />
              <span className={u.active ? "" : "line-through opacity-60"}>
                <b className="font-extrabold">{u.name}</b> · {u.email} · {u.role === "owner" ? "majitelka" : "floristka"}
              </span>
              {isOwner && u.id !== session?.userId && (
                <button className="min-h-[40px] rounded-xl px-2 text-[12px] font-extrabold text-brand-text">{u.active ? "Deaktivovat" : "Aktivovat"}</button>
              )}
            </form>
          ))}
          {isOwner && (
            <form action={createAdminUserAction} className="flex flex-col gap-2 rounded-field border border-dashed border-line-2 p-3">
              <Hint>Nový uživatel</Hint>
              <Input name="name" placeholder="jméno" required />
              <Input name="email" type="email" placeholder="e-mail" required />
              <Input name="password" type="password" placeholder="heslo (min. 8 znaků)" required minLength={8} />
              <div className="grid grid-cols-2 gap-2">
                <Select name="role" defaultValue="florist">
                  <option value="florist">floristka</option>
                  <option value="owner">majitelka</option>
                </Select>
                <Select name="storeId" defaultValue="">
                  <option value="">výchozí prodejna</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.shortName}</option>
                  ))}
                </Select>
              </div>
              <SubmitButton size="sm" variant="secondary">Přidat uživatele</SubmitButton>
            </form>
          )}
        </Card>

        {isOwner && (
          <Card>
            <CardTitle>Databáze</CardTitle>
            <Hint>Po nasazení nové verze aplikace spusťte aktualizaci databáze (migrace). Je bezpečná a lze ji spouštět opakovaně.</Hint>
            <form action={migrateAction}>
              <SubmitButton size="sm" variant="ghost" pendingText="Aktualizuji…">Aktualizovat databázi</SubmitButton>
            </form>
          </Card>
        )}
      </div>
      <div className="flex-1" />
      <AdminNav current="/admin/nastaveni" />
    </>
  );
}
