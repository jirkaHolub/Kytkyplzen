import type { Db } from "@/db";
import { auditLog } from "@/db/schema";
import type { Session } from "@/lib/auth";

export async function writeAudit(
  db: Db,
  session: Session | null,
  entry: { action: string; entity: string; entityId?: string | null; before?: unknown; after?: unknown },
) {
  await db.insert(auditLog).values({
    adminUserId: session?.userId ?? null,
    adminName: session?.name ?? null,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    before: entry.before ?? null,
    after: entry.after ?? null,
  });
}
