"use client";

import { useActionState } from "react";
import { loginAction } from "@/modules/admin/actions";
import { Card, Field, Input, Notice } from "@/components/ui";
import { SubmitButton } from "./forms";

export function LoginForm({ zpet }: { zpet?: string }) {
  const [state, action] = useActionState(loginAction, null);
  return (
    <form action={action}>
      <Card>
        {state?.error && <Notice tone="danger">{state.error}</Notice>}
        <input type="hidden" name="zpet" value={zpet ?? ""} />
        <Field label="E-mail">
          <Input name="email" type="email" autoComplete="username" required inputMode="email" defaultValue={state?.email ?? ""} />
        </Field>
        <Field label="Heslo">
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <SubmitButton pendingText="Přihlašuji…">Přihlásit se</SubmitButton>
      </Card>
    </form>
  );
}
