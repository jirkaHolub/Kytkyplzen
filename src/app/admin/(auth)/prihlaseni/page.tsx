import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { hasDatabase } from "@/db";
import { getSession } from "@/lib/auth";
import { countAdminUsers } from "@/modules/catalog/queries";
import { NoDatabase } from "@/components/shop/NoDatabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Přihlášení do administrace", robots: { index: false } };

export default async function LoginPage(props: PageProps<"/admin/prihlaseni">) {
  if (!hasDatabase()) return <NoDatabase />;
  const session = await getSession();
  if (session) redirect("/admin/nabidka");
  const sp = await props.searchParams;
  let users = 0;
  try {
    users = await countAdminUsers();
  } catch {
    // tabulky ještě neexistují: první spuštění
  }
  if (users === 0) redirect("/admin/setup");
  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <span className="font-hand text-[40px] font-bold text-brand">Kytky Plzeň</span>
        <div className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-muted">Administrace</div>
      </div>
      <LoginForm zpet={typeof sp.zpet === "string" ? sp.zpet : undefined} />
    </div>
  );
}
