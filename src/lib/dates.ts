import { TZDate } from "@date-fns/tz";
import { format, parse } from "date-fns";
import { cs } from "date-fns/locale";
import { PRAGUE } from "@/modules/catalog/availability";

export const WEEKDAYS_CS = ["pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota", "neděle"];
export const WEEKDAYS_SHORT_CS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

/** "2026-11-19" -> "čt 19. 11." */
export function formatDayShort(ymd: string): string {
  const d = parse(ymd, "yyyy-MM-dd", new Date());
  return format(d, "EEEEEE d. M.", { locale: cs });
}

/** "2026-11-19" -> "čtvrtek 19. 11." */
export function formatDayLong(ymd: string): string {
  const d = parse(ymd, "yyyy-MM-dd", new Date());
  return format(d, "EEEE d. M.", { locale: cs });
}

/** Čas v Praze: "14:05" */
export function formatTimePrague(d: Date): string {
  return format(new TZDate(d, PRAGUE), "HH:mm");
}

/** Datum a čas v Praze: "19. 11. 2026 14:05" */
export function formatDateTimePrague(d: Date): string {
  return format(new TZDate(d, PRAGUE), "d. M. yyyy HH:mm");
}

/** Hodnota pro <input type="datetime-local"> v pražském čase. */
export function toDateTimeLocal(d: Date | null | undefined): string {
  if (!d) return "";
  return format(new TZDate(d, PRAGUE), "yyyy-MM-dd'T'HH:mm");
}

/** Z <input type="datetime-local"> (pražský čas) na Date. */
export function fromDateTimeLocal(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(s);
  if (!m) return null;
  const d = new TZDate(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], 0, PRAGUE);
  return new Date(d.getTime());
}

/** Index dne v týdnu v Praze: 0 = pondělí ... 6 = neděle. */
export function weekdayPrague(d = new Date()): number {
  const day = new TZDate(d, PRAGUE).getDay(); // 0 = neděle
  return (day + 6) % 7;
}
