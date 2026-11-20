import type { MetadataRoute } from "next";
import { hasDatabase } from "@/db";
import { listOffer } from "@/modules/catalog/queries";
import { productHref } from "@/components/shop/ProductCard";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kytkyplzen.vercel.app";
  const staticPages = ["", "/kytice", "/doplnky", "/prodejny"].map((p) => ({ url: `${base}${p}`, changeFrequency: "daily" as const }));
  if (!hasDatabase()) return staticPages;
  try {
    const offer = await listOffer();
    return [...staticPages, ...offer.map((p) => ({ url: `${base}${productHref(p)}`, lastModified: p.updatedAt, changeFrequency: "daily" as const }))];
  } catch {
    return staticPages;
  }
}
