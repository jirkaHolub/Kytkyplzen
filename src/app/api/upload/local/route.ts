import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

/** Lokální vývoj bez Vercel Blob: uloží fotku do .data/uploads. Na Vercelu se nepoužívá. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nepřihlášeno" }, { status: 401 });
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) return NextResponse.json({ error: "Lokální úložiště není k dispozici" }, { status: 400 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Chybí soubor" }, { status: 400 });
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const dir = path.join(process.cwd(), ".data", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/files/${safe}` });
}
