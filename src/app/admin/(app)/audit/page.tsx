import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { AdminNav, AdminTop } from "@/components/admin/AdminChrome";
import { getDb } from "@/db";
import { auditLog } from "@/db/schema";
import { formatDateTimePrague } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Audit log · Admin", robots: { index: false } };

const actionLabel: Record<string, string> = {
  create: "vytvořeno",
  update: "upraveno",
  delete: "smazáno",
  status: "změna stavu",
  stock: "sklad",
  remove_image: "smazána fotka",
  setup: "první nastavení",
  migrate: "migrace databáze",
  deactivate: "deaktivace",
  activate: "aktivace",
};

export default async function AuditPage() {
  const db = await getDb();
  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(200);
  return (
    <>
      <AdminTop title="Historie změn" back={{ href: "/admin/vice", label: "Více" }} />
      <div className="flex flex-col gap-1.5 px-4 py-3">
        {rows.length === 0 && <p className="py-8 text-center text-[14px] text-muted">Zatím žádné záznamy.</p>}
        {rows.map((r) => (
          <div key={r.id} className="rounded-field border border-line bg-white px-3 py-2 text-[13px]">
            <div className="flex justify-between gap-2 font-bold">
              <span>
                {actionLabel[r.action] ?? r.action} · {r.entity}
              </span>
              <span className="text-muted">{formatDateTimePrague(r.createdAt)}</span>
            </div>
            <div className="text-[12px] text-muted">
              {r.adminName ?? "systém"}
              {r.after ? ` · ${JSON.stringify(r.after).slice(0, 140)}` : ""}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1" />
      <AdminNav current="/admin/vice" />
    </>
  );
}
