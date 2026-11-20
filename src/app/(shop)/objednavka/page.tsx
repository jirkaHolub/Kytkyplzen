import type { Metadata } from "next";
import Link from "next/link";
import { BottomNav } from "@/components/shop/Chrome";
import { NoDatabase } from "@/components/shop/NoDatabase";
import { ButtonLink, Card, Notice, SectionTitle } from "@/components/ui";
import { hasDatabase } from "@/db";
import { formatCzk } from "@/lib/money";
import { getProductBySlug } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Objednávka" };

export default async function OrderPage(props: PageProps<"/objednavka">) {
  if (!hasDatabase()) return <NoDatabase />;
  const sp = await props.searchParams;
  const slug = typeof sp.produkt === "string" ? sp.produkt : null;
  const p = slug ? await getProductBySlug(slug) : null;
  return (
    <>
      <SectionTitle>Objednávka</SectionTitle>
      <div className="flex flex-col gap-3 px-4 py-1.5">
        {p && (
          <Card>
            <div className="flex items-center justify-between gap-3">
              <span className="font-extrabold">{p.name}</span>
              <span className="font-extrabold text-brand-text">{formatCzk(p.priceCents)}</span>
            </div>
          </Card>
        )}
        <Notice tone="info">
          Online objednávka s výběrem termínu, adresy a platbou kartou je obsahem fáze 2 a připravuje se. Zatím objednáte
          telefonicky nebo zprávou na Instagramu.
        </Notice>
        <ButtonLink href="tel:+420732466589">Zavolat +420 732 466 589</ButtonLink>
        <ButtonLink href="https://www.instagram.com/kytky_plzen/" variant="secondary">
          Napsat na Instagram @kytky_plzen
        </ButtonLink>
        <Link href="/" className="text-center text-[14px] font-bold text-brand-text">
          ‹ Zpět do nabídky
        </Link>
      </div>
      <div className="flex-1" />
      <BottomNav current="/objednavka" />
    </>
  );
}
