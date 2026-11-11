const TZ = "America/New_York";
const TODAY = "2026-11-11";

function parts(iso: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const list = fmt.formatToParts(new Date(iso));
  const get = (type: string) => list.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function shiftKey(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function dayKey(iso: string) {
  return parts(iso);
}

export function isSameDay(iso: string, key = TODAY) {
  return parts(iso) === key;
}

export function dayLabel(iso: string) {
  const key = parts(iso);
  if (key === TODAY) return "Today";
  if (key === shiftKey(TODAY, -1)) return "Yesterday";
  if (key === shiftKey(TODAY, 1)) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function usDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function usTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function usDateTime(iso: string) {
  return `${usDate(iso)} · ${usTime(iso)}`;
}

export function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function fullName(p: { firstName: string; lastName: string }) {
  return `${p.firstName} ${p.lastName}`;
}

export function initials(p: { firstName: string; lastName: string }) {
  return `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
}

/** Wednesday, Nov 11, 2026 is the estate clock used across the prototype. */
export function at(dayOffset: number, hour: number, minute = 0) {
  return new Date(Date.UTC(2026, 10, 11 + dayOffset, hour + 5, minute, 0)).toISOString();
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayKey() {
  return TODAY;
}

export function monthMatrix(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const startDow = first.getUTCDay();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<{ day: number; key: string } | null> = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, key });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const ESTATE_YEAR = 2026;
export const ESTATE_MONTH = 10;
