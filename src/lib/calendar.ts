import { cacheLife } from "next/cache";
import { SITE } from "./config";
import { parseEvents, type CalendarEvent } from "./ical-parse";

export type { CalendarEvent };

const DAYS_AHEAD = 120;

export async function getEvents(limit = 60): Promise<CalendarEvent[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  try {
    const res = await fetch(SITE.calendarIcsUrl);
    if (!res.ok) return [];
    const now = new Date();
    const until = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);
    return parseEvents(await res.text(), now, until, limit);
  } catch {
    return [];
  }
}
