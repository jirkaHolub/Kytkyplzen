import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ mode: process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local" });
}

/** Vercel Blob: vydá klientovi token pro přímé nahrání fotky (jen přihlášený admin). */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nepřihlášeno" }, { status: 401 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        addRandomSuffix: true,
        maximumSizeInBytes: 8 * 1024 * 1024,
        tokenPayload: JSON.stringify({ userId: session.userId }),
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Nahrání se nepovedlo" }, { status: 400 });
  }
}
