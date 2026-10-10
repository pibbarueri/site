import { cacheLife } from "next/cache";
import { SITE } from "./config";
import { dayInZone, startOfMonth } from "./dates";
import { parseCalendar, type CalendarEvent, type ParsedCalendar, type WeeklyItem } from "./ical-parse";

export type { CalendarEvent, ParsedCalendar, WeeklyItem };

// The calendar view shows the current month and the 11 after it.
const MONTHS_SHOWN = 12;
const MAX_EVENTS = 600;

// `events` are the agenda entries (one-off and monthly events, plus edited or cancelled
// occurrences of weekly routine events). `weekly` is the standing weekly schedule.
export async function getCalendar(): Promise<ParsedCalendar> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  const now = new Date();
  const today = dayInZone(now);
  const empty: ParsedCalendar = { events: [], upcoming: [], weekly: [], today };
  try {
    const res = await fetch(SITE.calendarIcsUrl);
    if (!res.ok) return empty;
    return parseCalendar(await res.text(), {
      from: startOfMonth(today),
      now,
      until: startOfMonth(today, MONTHS_SHOWN),
      limit: MAX_EVENTS,
    });
  } catch {
    return empty;
  }
}
