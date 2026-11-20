import type { Metadata } from "next";
import { BottomNav } from "@/components/shop/Chrome";
import { NoDatabase } from "@/components/shop/NoDatabase";
import { Card, SectionTitle } from "@/components/ui";
import { hasDatabase } from "@/db";
import { WEEKDAYS_SHORT_CS, weekdayPrague } from "@/lib/dates";
import { getStoreHours, listStores } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prodejny" };

export default async function StoresPage() {
  if (!hasDatabase()) return <NoDatabase />;
  const stores = await listStores();
  const hours = await Promise.all(stores.map((s) => getStoreHours(s.id)));
  const today = weekdayPrague();
  const jsonLd = stores.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Florist",
    name: s.name,
    telephone: s.phone ?? undefined,
    address: { "@type": "PostalAddress", streetAddress: s.addressLine, addressLocality: s.city, postalCode: s.zip, addressCountry: "CZ" },
    geo: s.lat && s.lng ? { "@type": "GeoCoordinates", latitude: Number(s.lat), longitude: Number(s.lng) } : undefined,
  }));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SectionTitle hand="přijďte se podívat">Prodejny</SectionTitle>
      <div className="flex flex-col gap-3 px-4 py-1.5">
        {stores.map((s, i) => (
          <Card key={s.id}>
            <h2 className="text-[17px] font-extrabold">{s.shortName}</h2>
            <p className="text-[14px]">
              {s.addressLine}, {s.zip} {s.city}
            </p>
            {s.phone && (
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-[14px] font-bold text-brand-text">
                {s.phone}
              </a>
            )}
            <div className="grid grid-cols-7 gap-1 text-center text-[12px]">
              {hours[i].map((h) => (
                <div key={h.weekday} className={`rounded-lg py-1.5 ${h.weekday === today ? "bg-blush font-extrabold text-brand-text" : "text-muted"}`}>
                  <div>{WEEKDAYS_SHORT_CS[h.weekday]}</div>
                  <div className="text-[11px]">{h.closed ? "zavřeno" : `${h.opens.replace(/^0/, "")}–${h.closes.replace(/^0/, "")}`}</div>
                </div>
              ))}
            </div>
            {s.lat && s.lng && (
              <a
                href={`https://mapy.cz/zakladni?q=${encodeURIComponent(`${s.addressLine}, ${s.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="text-[14px] font-bold text-brand-text"
              >
                Otevřít v Mapy.cz
              </a>
            )}
          </Card>
        ))}
      </div>
      <div className="flex-1" />
      <BottomNav current="/prodejny" />
    </>
  );
}
