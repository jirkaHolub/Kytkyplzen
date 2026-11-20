import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { databaseMode, getDb } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const mode = databaseMode();
  if (mode === "none") return NextResponse.json({ ok: false, database: "missing" }, { status: 503 });
  try {
    const db = await getDb();
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, database: mode });
  } catch (e) {
    return NextResponse.json({ ok: false, database: mode, error: e instanceof Error ? e.message : String(e) }, { status: 503 });
  }
}
