// Types shared by the calendar reader (server) and the calendar view (browser). This file must
// stay free of heavy imports: the browser bundle includes it.

export type CalendarEvent = {
  id: string;
  title: string;
  // Full ISO string for timed events. YYYY-MM-DD for all-day events.
  start: string;
  // Last day (inclusive) for all-day events. ISO string for timed events.
  end: string | null;
  allDay: boolean;
  location?: string;
  description?: string;
  // Only set for one occurrence of a weekly routine event that is different from usual:
  // "changed" (other time or title) or "cancelled" (it will not happen).
  kind?: "changed" | "cancelled";
};

// A weekly routine event (EBD, Culto, GPs...), shown as a standing schedule instead of
// repeating in the agenda every week.
export type WeeklyItem = {
  weekday: number; // 0 = Sunday
  time: string; // HH:mm in SITE.timeZone
  title: string;
  note?: string;
};

export type ParsedCalendar = {
  // Every agenda entry between `from` and `until`.
  events: CalendarEvent[];
  // The subset of `events` that has not ended yet at `now`.
  upcoming: CalendarEvent[];
  weekly: WeeklyItem[];
  // Today in SITE.timeZone (YYYY-MM-DD), taken when the calendar was read.
  today: string;
};

// Only used for sorting. Brazil has had no daylight saving time since 2019.
export function toInstant(e: Pick<CalendarEvent, "start" | "allDay">): number {
  return Date.parse(e.allDay ? `${e.start}T00:00:00-03:00` : e.start);
}
