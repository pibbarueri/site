import ICAL from "ical.js";
import { SITE } from "./config";

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
};

const MAX_ITERATIONS = 5000;
const MAX_PER_EVENT = 60;

function todayInZone(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function previousDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

// Google Calendar stores the description as HTML when the text is formatted.
function cleanDescription(text: string): string | undefined {
  const clean = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return clean || undefined;
}

// Only used for sorting. Brazil has had no daylight saving time since 2019.
export function toInstant(e: Pick<CalendarEvent, "start" | "allDay">): number {
  return Date.parse(e.allDay ? `${e.start}T00:00:00-03:00` : e.start);
}

export function parseEvents(
  text: string,
  from: Date,
  until: Date,
  limit: number,
): CalendarEvent[] {
  const calendar = new ICAL.Component(ICAL.parse(text));
  for (const tz of calendar.getAllSubcomponents("vtimezone")) {
    ICAL.TimezoneService.register(tz);
  }

  const masters: ICAL.Event[] = [];
  const exceptions: ICAL.Event[] = [];
  for (const v of calendar.getAllSubcomponents("vevent")) {
    const ev = new ICAL.Event(v);
    (ev.isRecurrenceException() ? exceptions : masters).push(ev);
  }
  for (const ex of exceptions) {
    const master = masters.find((m) => m.uid === ex.uid);
    if (master) master.relateException(ex);
    else masters.push(ex);
  }

  const today = todayInZone(from);
  const result: CalendarEvent[] = [];

  // Returns false once the occurrences are past the window and iteration can stop.
  const record = (
    base: ICAL.Event,
    item: ICAL.Event,
    start: ICAL.Time,
    end: ICAL.Time | null,
  ): boolean => {
    const allDay = start.isDate;
    let event: CalendarEvent;
    if (allDay) {
      const first = start.toString();
      const last = end ? previousDay(end.toString()) : first;
      if (last < today) return true;
      if (first > today && Date.parse(`${first}T00:00:00-03:00`) > until.getTime()) return false;
      event = {
        id: `${base.uid}-${first}`,
        title: item.summary || "Evento",
        start: first,
        end: last > first ? last : null,
        allDay: true,
        location: item.location || undefined,
        description: cleanDescription(item.description || ""),
      };
    } else {
      const begins = start.toJSDate();
      const ends = end ? end.toJSDate() : null;
      if (begins.getTime() > until.getTime()) return false;
      if ((ends ?? begins).getTime() < from.getTime()) return true;
      event = {
        id: `${base.uid}-${begins.toISOString()}`,
        title: item.summary || "Evento",
        start: begins.toISOString(),
        end: ends ? ends.toISOString() : null,
        allDay: false,
        location: item.location || undefined,
        description: cleanDescription(item.description || ""),
      };
    }
    result.push(event);
    return true;
  };

  for (const ev of masters) {
    if (!ev.isRecurring()) {
      record(ev, ev, ev.startDate, ev.endDate ?? null);
      continue;
    }
    const iterator = ev.iterator();
    let next: ICAL.Time | undefined;
    let iterations = 0;
    let accepted = 0;
    while ((next = iterator.next()) && iterations++ < MAX_ITERATIONS && accepted < MAX_PER_EVENT) {
      const details = ev.getOccurrenceDetails(next);
      const before = result.length;
      const keepGoing = record(ev, details.item, details.startDate, details.endDate ?? null);
      if (result.length > before) accepted++;
      if (!keepGoing) break;
    }
  }

  return result.sort((a, b) => toInstant(a) - toInstant(b)).slice(0, limit);
}
