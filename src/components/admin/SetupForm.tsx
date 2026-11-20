"use client";

import { useActionState } from "react";
import { setupAction } from "@/modules/admin/actions";
import { Card, Field, Hint, Input, Notice } from "@/components/ui";
import { SubmitButton } from "./forms";

export function SetupForm({ mode, dbError }: { mode: string; dbError: string | null }) {
  const [state, action] = useActionState(setupAction, null);
  return (
    <form action={action}>
      <Card>
        <p className="text-[14px]">
          Založí se účet majitelky, připraví databáze{mode === "postgres" ? " (Neon)" : " (lokální PGlite)"} a nahrají ukázková
          data, která potom upravíte v administraci.
        </p>
        {dbError && <Notice tone="info">Databáze je prázdná, tabulky se vytvoří při odeslání.</Notice>}
        {state?.error && <Notice tone="danger">{state.error}</Notice>}
        <Field label="Jméno">
          <Input name="name" required autoComplete="name" />
        </Field>
        <Field label="E-mail (přihlašovací)">
          <Input name="email" type="email" required autoComplete="username" />
        </Field>
        <Field label="Heslo (min. 8 znaků)">
          <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <label className="flex min-h-[44px] items-center gap-3 text-[14px] font-bold">
          <input type="checkbox" name="seed" defaultChecked className="h-5 w-5 accent-brand" />
          Nahrát ukázková data (prodejny, balení, sazby DPH, ukázkové kytice)
        </label>
        <SubmitButton pendingText="Zakládám…">Založit a přihlásit</SubmitButton>
        <Hint>Tato stránka funguje jen do založení prvního účtu.</Hint>
      </Card>
    </form>
  );
}
