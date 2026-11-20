"use client";

import { useRef, useState } from "react";

type Uploaded = { url: string };

/** Zmenší fotku v prohlížeči (max 1600 px, JPEG), aby šla nahrát rychle i z mobilu. */
async function shrinkImage(file: File, maxSide = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.86));
}

async function uploadBlob(blob: Blob, filename: string): Promise<Uploaded> {
  const modeRes = await fetch("/api/upload", { method: "GET" });
  const { mode } = (await modeRes.json()) as { mode: "blob" | "local" };
  if (mode === "blob") {
    const { upload } = await import("@vercel/blob/client");
    const res = await upload(`produkty/${filename}`, blob, { access: "public", handleUploadUrl: "/api/upload", contentType: "image/jpeg" });
    return { url: res.url };
  }
  const fd = new FormData();
  fd.append("file", blob, filename);
  const res = await fetch("/api/upload/local", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Nahrání se nepovedlo");
  return (await res.json()) as Uploaded;
}

export function PhotoUpload({ initial = [], max = 4 }: { initial?: string[]; max?: number }) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const next = [...urls];
      for (const f of Array.from(files).slice(0, max - urls.length)) {
        const blob = await shrinkImage(f);
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;
        const up = await uploadBlob(blob, name);
        next.push(up.url);
      }
      setUrls(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nahrání se nepovedlo");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  const main = urls[0];
  return (
    <div className="flex flex-col gap-2">
      {urls.map((u) => (
        <input key={u} type="hidden" name="imageUrl" value={u} />
      ))}
      <div className="relative flex aspect-[4/3] flex-col items-center justify-center gap-2 overflow-hidden rounded-card border-2 border-dashed border-brand-soft bg-blush text-brand-text">
        {main && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={main} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="relative z-[1] flex gap-2">
          <button
            type="button"
            disabled={busy || urls.length >= max}
            onClick={() => inputRef.current?.click()}
            className="min-h-[48px] rounded-xl bg-white/95 px-4 text-[14px] font-extrabold shadow disabled:opacity-60"
          >
            {busy ? "Nahrávám…" : main ? "📷 Vyfotit další" : "📷 Vyfotit"}
          </button>
          <button
            type="button"
            disabled={busy || urls.length >= max}
            onClick={() => galleryRef.current?.click()}
            className="min-h-[48px] rounded-xl bg-white/95 px-4 text-[14px] font-extrabold shadow disabled:opacity-60"
          >
            🖼 Z galerie
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </div>
      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {urls.map((u, i) => (
            <div key={u} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="odebrat"
                onClick={() => setUrls(urls.filter((_, j) => j !== i))}
                className="absolute right-0.5 top-0.5 grid h-6 w-6 place-items-center rounded-full bg-white text-[12px] font-extrabold shadow"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-[12px] font-bold text-danger">{error}</p>}
      {urls.length === 1 && (
        <button type="button" onClick={() => setUrls([])} className="self-start text-[12px] font-bold text-muted">
          Odebrat fotku
        </button>
      )}
    </div>
  );
}
