import { redirect } from "next/navigation";
import { NoDatabase } from "@/components/shop/NoDatabase";
import { hasDatabase } from "@/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminAppLayout({ children }: LayoutProps<"/admin">) {
  if (!hasDatabase()) return <NoDatabase />;
  const session = await getSession();
  if (!session) redirect("/admin/prihlaseni");
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[520px] flex-1 flex-col bg-bg sm:my-4 sm:min-h-0 sm:rounded-[28px] sm:border sm:border-line sm:shadow-[0_30px_60px_-30px_rgba(43,30,39,.35)]">
      {children}
    </div>
  );
}
