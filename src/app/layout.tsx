import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/700.css";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kytkyplzen.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Kytky Plzeň", template: "%s · Kytky Plzeň" },
  description:
    "Květinářství Kytky Plzeň: denní nabídka hotových kytic, kytice na míru a rozvoz po Plzni na konkrétní hodinu.",
  openGraph: { siteName: "Kytky Plzeň", locale: "cs_CZ", type: "website" },
  robots: process.env.VERCEL_ENV === "production" ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fffbfd",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
