import { cacheLife } from "next/cache";
import { SITE } from "./config";
import { parseCalendar, type CalendarEvent, type ParsedCalendar, type WeeklyItem } from "./ical-parse";

export type { CalendarEvent, ParsedCalendar, WeeklyItem };

const DAYS_AHEAD = 120;
const MAX_EVENTS = 60;

// `events` are the agenda entries (one-off and monthly events, plus edited or cancelled
// occurrences of weekly routine events). `weekly` is the standing weekly schedule.
export async function getCalendar(): Promise<ParsedCalendar> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  try {
    const res = await fetch(SITE.calendarIcsUrl);
    if (!res.ok) return { events: [], weekly: [] };
    const now = new Date();
    const until = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);
    return parseCalendar(await res.text(), now, until, MAX_EVENTS);
  } catch {
    return { events: [], weekly: [] };
  }
}
