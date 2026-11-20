import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kytkyplzen.vercel.app";
  const production = process.env.VERCEL_ENV === "production";
  return {
    rules: production ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] } : { userAgent: "*", disallow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
