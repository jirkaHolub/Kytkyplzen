import Link from "next/link";
import type { Metadata } from "next";
import { AdminNav, AdminTop } from "@/components/admin/AdminChrome";
import { SubmitButton } from "@/components/admin/forms";
import { Card, CardTitle, Hint } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/modules/admin/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Více · Admin", robots: { index: false } };

export default async function MorePage() {
  const session = await getSession();
  return (
    <>
      <AdminTop title="Více" subtitle={session ? `${session.name} · ${session.role === "owner" ? "majitelka" : "floristka"}` : ""} />
      <div className="flex flex-col gap-3 px-4 py-3">
        <Card>
          <CardTitle>Přehledy a provoz</CardTitle>
          <Link href="/admin/audit" className="flex min-h-[48px] items-center justify-between rounded-field border border-line px-3 text-[14px] font-bold">Historie změn (audit log)<span className="text-brand-text">›</span></Link>
          <Link href="/" className="flex min-h-[48px] items-center justify-between rounded-field border border-line px-3 text-[14px] font-bold">Otevřít web<span className="text-brand-text">›</span></Link>
          <Hint>Objednávky dne, formulář pro Instagram a odkaz pro řidiče přibudou ve fázi 3. Věrnostní program a režim Prodejna ve fázi 4.</Hint>
        </Card>
        <form action={logoutAction}>
          <SubmitButton variant="ghost" pendingText="Odhlašuji…">Odhlásit se</SubmitButton>
        </form>
      </div>
      <div className="flex-1" />
      <AdminNav current="/admin/vice" />
    </>
  );
}
