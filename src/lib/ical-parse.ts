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
  events: CalendarEvent[];
  weekly: WeeklyItem[];
};

// A series that repeats every week for at least this long is routine. Shorter weekly series
// (a 3 week conference, a 6 week course) and monthly or yearly events are regular agenda events.
const ROUTINE_MIN_WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ITERATIONS = 5000;
const MAX_PER_EVENT = 60;
const WEEKDAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function weekdayInZone(date: Date): number {
  const short = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE.timeZone,
    weekday: "short",
  }).format(date);
  return WEEKDAY_SHORT.indexOf(short);
}

function timeInZone(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
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

type Phase = "past" | "in" | "after";

function isRoutine(ev: ICAL.Event): boolean {
  if (!ev.isRecurring()) return false;
  const rule = ev.component.getFirstPropertyValue("rrule") as ICAL.Recur | null;
  if (!rule || rule.freq !== "WEEKLY" || (rule.interval ?? 1) !== 1) return false;
  if (rule.count) return rule.count >= ROUTINE_MIN_WEEKS;
  if (rule.until) {
    const weeks = (rule.until.toJSDate().getTime() - ev.startDate.toJSDate().getTime()) / WEEK_MS;
    return weeks >= ROUTINE_MIN_WEEKS;
  }
  return true;
}

function isCancelled(item: ICAL.Event): boolean {
  return item.component.getFirstPropertyValue("status") === "CANCELLED";
}

function weeklyItems(ev: ICAL.Event): WeeklyItem[] {
  const rule = ev.component.getFirstPropertyValue("rrule") as ICAL.Recur;
  const codes = (rule.getComponent("BYDAY") as string[]).map((c) => c.slice(-2));
  const first = ev.startDate.toJSDate();
  const weekdays = codes.length > 0 ? codes.map((c) => WEEKDAY_CODES.indexOf(c)) : [weekdayInZone(first)];
  return weekdays
    .filter((d) => d >= 0)
    .map((weekday) => ({
      weekday,
      time: timeInZone(first),
      title: ev.summary || "Evento",
      note: cleanDescription(ev.description || ""),
    }));
}

export function parseCalendar(
  text: string,
  from: Date,
  until: Date,
  limit: number,
): ParsedCalendar {
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
  const events: CalendarEvent[] = [];
  const weekly = new Map<string, WeeklyItem>();

  const phaseOf = (start: ICAL.Time, end: ICAL.Time | null): Phase => {
    if (start.isDate) {
      const first = start.toString();
      const last = end ? previousDay(end.toString()) : first;
      if (last < today) return "past";
      if (Date.parse(`${first}T00:00:00-03:00`) > until.getTime()) return "after";
      return "in";
    }
    const begins = start.toJSDate().getTime();
    const ends = end ? end.toJSDate().getTime() : begins;
    if (begins > until.getTime()) return "after";
    if (ends < from.getTime()) return "past";
    return "in";
  };

  const build = (
    base: ICAL.Event,
    item: ICAL.Event,
    start: ICAL.Time,
    end: ICAL.Time | null,
    kind?: CalendarEvent["kind"],
  ): CalendarEvent => {
    const shared = {
      title: item.summary || "Evento",
      location: item.location || undefined,
      description: cleanDescription(item.description || ""),
      kind,
    };
    if (start.isDate) {
      const first = start.toString();
      const last = end ? previousDay(end.toString()) : first;
      return {
        ...shared,
        id: `${base.uid}-${first}`,
        start: first,
        end: last > first ? last : null,
        allDay: true,
      };
    }
    const begins = start.toJSDate();
    return {
      ...shared,
      id: `${base.uid}-${begins.toISOString()}`,
      start: begins.toISOString(),
      end: end ? end.toJSDate().toISOString() : null,
      allDay: false,
    };
  };

  for (const ev of masters) {
    if (!ev.isRecurring()) {
      const end = ev.endDate ?? null;
      if (phaseOf(ev.startDate, end) === "in") {
        events.push(build(ev, ev, ev.startDate, end, isCancelled(ev) ? "cancelled" : undefined));
      }
      continue;
    }

    const routine = isRoutine(ev);
    let active = false;
    let accepted = 0;
    const iterator = ev.iterator();
    let next: ICAL.Time | undefined;
    for (let i = 0; i < MAX_ITERATIONS && accepted < MAX_PER_EVENT; i++) {
      next = iterator.next();
      if (!next) break;
      const details = ev.getOccurrenceDetails(next);
      const end = details.endDate ?? null;
      const phase = phaseOf(details.startDate, end);
      if (phase === "past") continue;
      if (phase === "after") break;
      active = true;
      const isException = details.item !== ev;
      const cancelled = isCancelled(details.item);
      // Regular occurrences of a routine event live in the weekly schedule. Only the ones
      // that differ (edited or cancelled) go to the agenda.
      if (routine && !isException && !cancelled) continue;
      const kind = cancelled ? "cancelled" : routine ? "changed" : undefined;
      events.push(build(ev, details.item, details.startDate, end, kind));
      accepted++;
    }

    if (routine) {
      // Deleting a single occurrence in Google Calendar adds an EXDATE to the series.
      for (const prop of ev.component.getAllProperties("exdate")) {
        for (const value of prop.getValues() as ICAL.Time[]) {
          const end = value.clone();
          end.addDuration(ev.duration);
          if (phaseOf(value, end) !== "in") continue;
          active = true;
          events.push(build(ev, ev, value, end, "cancelled"));
        }
      }
      if (active) {
        for (const item of weeklyItems(ev)) {
          weekly.set(`${item.weekday}-${item.time}-${item.title.toLowerCase()}`, item);
        }
      }
    }
  }

  return {
    events: events.sort((a, b) => toInstant(a) - toInstant(b)).slice(0, limit),
    weekly: [...weekly.values()].sort(
      (a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time),
    ),
  };
}
