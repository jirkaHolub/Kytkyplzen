import { TZDate } from "@date-fns/tz";
import { addDays, format } from "date-fns";

export const PRAGUE = "Europe/Prague";

export type AvailabilityInput = {
  status: "draft" | "published" | "hidden" | "sold_out";
  publishAt: Date | null;
  unpublishAt: Date | null;
  trackStock: boolean;
  leadTimeDays: number;
  /** volné kusy po prodejnách (po odečtení rezervací) */
  stockByStore: { storeId: string; available: number }[];
};

export type Availability = {
  /** je produkt vidět v nabídce */
  visible: boolean;
  /** lze ho teď objednat */
  purchasable: boolean;
  /** celkem volných kusů (u produktů bez sledování skladu Infinity) */
  totalAvailable: number;
  /** nejdřívější datum doručení (YYYY-MM-DD v Praze) */
  earliestDate: string;
  /** krátký stav pro štítek */
  badge: "last_one" | "sold_out" | "preorder" | null;
};

/** Dnešní datum v Praze jako YYYY-MM-DD. */
export function todayInPrague(now = new Date()): string {
  return format(new TZDate(now, PRAGUE), "yyyy-MM-dd");
}

/** Přičte dny k datu v Praze. */
export function addDaysPrague(now: Date, days: number): string {
  return format(addDays(new TZDate(now, PRAGUE), days), "yyyy-MM-dd");
}

/** Je produkt právě teď zveřejněný podle stavu a plánovaného zveřejnění/stažení? */
export function isPublishedNow(
  p: Pick<AvailabilityInput, "status" | "publishAt" | "unpublishAt">,
  now = new Date(),
): boolean {
  if (p.status === "draft" || p.status === "hidden") return false;
  if (p.publishAt && p.publishAt.getTime() > now.getTime()) return false;
  if (p.unpublishAt && p.unpublishAt.getTime() <= now.getTime()) return false;
  return true;
}

export function computeAvailability(p: AvailabilityInput, now = new Date()): Availability {
  const visible = isPublishedNow(p, now);
  const totalAvailable = p.trackStock
    ? p.stockByStore.reduce((s, r) => s + Math.max(0, r.available), 0)
    : Number.POSITIVE_INFINITY;
  const soldOut = p.status === "sold_out" || (p.trackStock && totalAvailable <= 0);
  const purchasable = visible && !soldOut;
  const earliestDate = addDaysPrague(now, Math.max(0, p.leadTimeDays));
  let badge: Availability["badge"] = null;
  if (soldOut) badge = "sold_out";
  else if (p.leadTimeDays > 0) badge = "preorder";
  else if (p.trackStock && totalAvailable === 1) badge = "last_one";
  return { visible, purchasable, totalAvailable, earliestDate, badge };
}

/** Nejpozdější předstih z košíku určuje první možný den doručení. */
export function earliestDateForCart(leadTimes: number[], now = new Date()): string {
  const max = leadTimes.length ? Math.max(...leadTimes) : 0;
  return addDaysPrague(now, Math.max(0, max));
}
