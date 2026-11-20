import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetupForm } from "@/components/admin/SetupForm";
import { NoDatabase } from "@/components/shop/NoDatabase";
import { databaseMode, hasDatabase } from "@/db";
import { countAdminUsers } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "První nastavení", robots: { index: false } };

export default async function SetupPage() {
  if (!hasDatabase()) return <NoDatabase />;
  let users = 0;
  let dbError: string | null = null;
  try {
    users = await countAdminUsers();
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }
  if (users > 0) redirect("/admin/prihlaseni");
  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <span className="font-hand text-[40px] font-bold text-brand">Kytky Plzeň</span>
        <div className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-muted">První nastavení</div>
      </div>
      <SetupForm mode={databaseMode()} dbError={dbError} />
    </div>
  );
}
