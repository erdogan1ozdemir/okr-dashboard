/** ISO hafta yardımcıları. Hafta anahtarı "2026-W38" biçimindedir; İstanbul saatiyle hesaplanır. */
const DAY = 864e5;
const TZ = 3 * 36e5;

export function isoWeekKey(d: Date = new Date()): string {
  const s = new Date(d.getTime() + TZ);
  const dow = (s.getUTCDay() + 6) % 7;
  const mon = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate()) - dow * DAY;
  const thu = new Date(mon + 3 * DAY);
  const y = thu.getUTCFullYear();
  const jan4 = Date.UTC(y, 0, 4);
  const w1 = jan4 - ((new Date(jan4).getUTCDay() + 6) % 7) * DAY;
  const no = 1 + Math.round((mon - w1) / (7 * DAY));
  return `${y}-W${String(no).padStart(2, "0")}`;
}

export function weekRange(key: string): { monday: Date; friday: Date; sunday: Date } {
  const [y, w] = key.split("-W").map(Number);
  const jan4 = Date.UTC(y, 0, 4);
  const w1 = jan4 - ((new Date(jan4).getUTCDay() + 6) % 7) * DAY;
  const mon = w1 + (w - 1) * 7 * DAY;
  return { monday: new Date(mon), friday: new Date(mon + 4 * DAY), sunday: new Date(mon + 6 * DAY) };
}

export function shiftWeek(key: string, n: number): string {
  const { monday } = weekRange(key);
  return isoWeekKey(new Date(monday.getTime() + n * 7 * DAY - TZ + 12 * 36e5));
}

export function monthKey(d: Date = new Date()): string {
  const s = new Date(d.getTime() + TZ);
  return `${s.getUTCFullYear()}-${String(s.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Atama ritmine göre bu hafta toplantı bekleniyor mu */
export function meetingExpected(
  rhythm: "weekly" | "biweekly" | "monthly" | "none",
  anchor: string | Date | null,
  week: string,
): boolean {
  if (rhythm === "weekly") return true;
  if (rhythm === "biweekly" && anchor) {
    const a = weekRange(isoWeekKey(new Date(anchor))).monday.getTime();
    const b = weekRange(week).monday.getTime();
    return Math.round((b - a) / (7 * DAY)) % 2 === 0;
  }
  return false; // aylık ritim takvimden gelir
}
