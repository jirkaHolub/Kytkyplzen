import { ShopFooter, ShopHeader } from "@/components/shop/Chrome";
import { hasDatabase } from "@/db";
import { getSetting } from "@/modules/catalog/queries";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const tagline = hasDatabase() ? await getSetting("texts.tagline", "Květiny až ke dveřím").catch(() => "Květiny až ke dveřím") : "Květiny až ke dveřím";
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[520px] flex-1 flex-col bg-bg sm:my-4 sm:min-h-0 sm:rounded-[28px] sm:border sm:border-line sm:shadow-[0_30px_60px_-30px_rgba(43,30,39,.35)]">
      <ShopHeader tagline={tagline} />
      <div className="flex flex-1 flex-col">{children}</div>
      <ShopFooter />
    </div>
  );
}
