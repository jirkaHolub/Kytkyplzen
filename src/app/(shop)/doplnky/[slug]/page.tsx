import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoDatabase } from "@/components/shop/NoDatabase";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { hasDatabase } from "@/db";
import { getProductBySlug, listStores } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/doplnky/[slug]">): Promise<Metadata> {
  if (!hasDatabase()) return {};
  const { slug } = await props.params;
  const p = await getProductBySlug(slug);
  return p ? { title: p.name, description: p.description ?? undefined } : {};
}

export default async function AddonPage(props: PageProps<"/doplnky/[slug]">) {
  if (!hasDatabase()) return <NoDatabase />;
  const { slug } = await props.params;
  const p = await getProductBySlug(slug);
  if (!p || !p.availability.visible || p.type !== "addon") notFound();
  const stores = await listStores();
  return <ProductDetail p={p} packaging={[]} addons={[]} stores={stores} backHref="/doplnky" backLabel="Doplňky" />;
}
