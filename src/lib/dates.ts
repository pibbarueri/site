import { SITE } from "./config";

// Calendar days are plain "YYYY-MM-DD" strings in SITE.timeZone, months are "YYYY-MM".
// Never build a calendar day from `new Date()` directly: the server runs in UTC.

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: SITE.timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function dayInZone(date: Date): string {
  return dayFormat.format(date);
}

export function monthOf(day: string): string {
  return day.slice(0, 7);
}

export function addMonths(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

// Midnight (Brazil has had no daylight saving time since 2019) of the first day of the month
// that is `monthsAhead` months after the month of `day`.
export function startOfMonth(day: string, monthsAhead = 0): Date {
  return new Date(`${addMonths(monthOf(day), monthsAhead)}-01T00:00:00-03:00`);
}
