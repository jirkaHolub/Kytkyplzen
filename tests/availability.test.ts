import { describe, expect, it } from "vitest";
import {
  addDaysPrague,
  computeAvailability,
  earliestDateForCart,
  isPublishedNow,
  todayInPrague,
} from "@/modules/catalog/availability";
import { formatCzk, parseCzkToCents, splitVat } from "@/lib/money";

const base = {
  status: "published" as const,
  publishAt: null,
  unpublishAt: null,
  trackStock: true,
  leadTimeDays: 0,
  stockByStore: [{ storeId: "a", available: 1 }],
};

describe("dostupnost produktu", () => {
  it("datum v Praze respektuje časové pásmo (23:30 UTC je už další den)", () => {
    expect(todayInPrague(new Date("2026-11-19T23:30:00Z"))).toBe("2026-11-20");
    expect(todayInPrague(new Date("2026-11-19T22:30:00Z"))).toBe("2026-11-19");
    expect(addDaysPrague(new Date("2026-11-19T12:00:00Z"), 5)).toBe("2026-11-24");
  });

  it("plánované zveřejnění a stažení", () => {
    const now = new Date("2026-11-19T10:00:00Z");
    expect(isPublishedNow({ status: "published", publishAt: null, unpublishAt: null }, now)).toBe(true);
    expect(isPublishedNow({ status: "published", publishAt: new Date("2026-11-19T11:00:00Z"), unpublishAt: null }, now)).toBe(false);
    expect(isPublishedNow({ status: "published", publishAt: null, unpublishAt: new Date("2026-11-19T09:00:00Z") }, now)).toBe(false);
    expect(isPublishedNow({ status: "hidden", publishAt: null, unpublishAt: null }, now)).toBe(false);
    expect(isPublishedNow({ status: "sold_out", publishAt: null, unpublishAt: null }, now)).toBe(true);
  });

  it("poslední kus, vyprodáno, předobjednávka", () => {
    const now = new Date("2026-11-19T10:00:00Z");
    expect(computeAvailability(base, now).badge).toBe("last_one");
    expect(computeAvailability({ ...base, stockByStore: [{ storeId: "a", available: 0 }] }, now)).toMatchObject({
      purchasable: false,
      badge: "sold_out",
    });
    expect(computeAvailability({ ...base, status: "sold_out" }, now).purchasable).toBe(false);
    const premium = computeAvailability({ ...base, leadTimeDays: 5, trackStock: false, stockByStore: [] }, now);
    expect(premium).toMatchObject({ purchasable: true, badge: "preorder", earliestDate: "2026-11-24" });
  });

  it("předstih košíku = největší předstih položek", () => {
    const now = new Date("2026-11-19T10:00:00Z");
    expect(earliestDateForCart([0, 5, 2], now)).toBe("2026-11-24");
    expect(earliestDateForCart([], now)).toBe("2026-11-19");
  });
});

describe("peníze", () => {
  it("formátuje CZK", () => {
    expect(formatCzk(51000).replace(/ /g, " ")).toBe("510 Kč");
    expect(formatCzk(123450).replace(/ /g, " ")).toBe("1 234,50 Kč");
  });
  it("parsuje vstup z formuláře", () => {
    expect(parseCzkToCents("899")).toBe(89900);
    expect(parseCzkToCents("1 299,50 Kč")).toBe(129950);
    expect(parseCzkToCents("-5")).toBeNull();
    expect(parseCzkToCents("")).toBeNull();
  });
  it("rozpad DPH", () => {
    expect(splitVat(12100, 2100)).toEqual({ netCents: 10000, vatCents: 2100 });
    expect(splitVat(11200, 1200)).toEqual({ netCents: 10000, vatCents: 1200 });
  });
});
