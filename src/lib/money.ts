const czk = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 });
const czkDecimals = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", minimumFractionDigits: 2 });

/** 51000 haléřů -> "510 Kč" (celé koruny), jinak s haléři. */
export function formatCzk(cents: number): string {
  if (cents % 100 === 0) return czk.format(cents / 100);
  return czkDecimals.format(cents / 100);
}

export function parseCzkToCents(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  const s = String(input).replace(/\s/g, "").replace(",", ".").replace(/kč/i, "");
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/** Rozpad ceny včetně DPH na základ a daň. rateBp = setiny procenta (2100 = 21 %). */
export function splitVat(grossCents: number, rateBp: number): { netCents: number; vatCents: number } {
  const netCents = Math.round((grossCents * 10000) / (10000 + rateBp));
  return { netCents, vatCents: grossCents - netCents };
}
