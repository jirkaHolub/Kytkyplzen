import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  // SQL migrace musí být v balíčku funkce, která je spouští (první nastavení a aktualizace databáze)
  outputFileTracingIncludes: { "/admin/setup": ["./drizzle/**/*"], "/admin/nastaveni": ["./drizzle/**/*"] },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "cdn.myshoptet.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
