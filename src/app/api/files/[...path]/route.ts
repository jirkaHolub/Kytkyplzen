import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

/** Servíruje lokálně nahrané fotky z .data/uploads (jen vývoj). */
export async function GET(_req: Request, ctx: RouteContext<"/api/files/[...path]">) {
  const { path: parts } = await ctx.params;
  const name = parts.join("/");
  if (!/^[a-z0-9.-]+$/i.test(name)) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(process.cwd(), ".data", "uploads", name));
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
