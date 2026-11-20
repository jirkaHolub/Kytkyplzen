import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoDatabase } from "@/components/shop/NoDatabase";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { hasDatabase } from "@/db";
import { getProductBySlug, listOffer, listStores, packagingForProduct } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/kytice/[slug]">): Promise<Metadata> {
  if (!hasDatabase()) return {};
  const { slug } = await props.params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description ?? undefined,
    openGraph: { images: p.images[0] ? [{ url: p.images[0].url }] : undefined },
  };
}

export default async function ProductPage(props: PageProps<"/kytice/[slug]">) {
  if (!hasDatabase()) return <NoDatabase />;
  const { slug } = await props.params;
  const p = await getProductBySlug(slug);
  if (!p || !p.availability.visible || p.type === "addon") notFound();
  const [packaging, offer, stores] = await Promise.all([packagingForProduct(p.id), listOffer(), listStores()]);
  const addons = offer.filter((x) => x.type === "addon" && x.availability.purchasable).slice(0, 6);
  return <ProductDetail p={p} packaging={packaging} addons={addons} stores={stores} backHref="/" backLabel="Nabídka" />;
}
