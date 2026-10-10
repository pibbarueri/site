import ICAL from "ical.js";
import { toInstant, type CalendarEvent, type ParsedCalendar, type WeeklyItem } from "./calendar-types";
import { dayInZone } from "./dates";
import { SITE } from "./config";

export { toInstant };
export type { CalendarEvent, ParsedCalendar, WeeklyItem };

export type ParseOptions = {
  from: Date; // first moment of the agenda window (start of the current month)
  now: Date;
  until: Date;
  limit: number;
};

// A series that repeats every week for at least this long is routine. Shorter weekly series
// (a 3 week conference, a 6 week course) and monthly or yearly events are regular agenda events.
const ROUTINE_MIN_WEEKS = 8;
// A routine item is shown in the weekly block while it has an occurrence in the next days.
// When a semester ends the item leaves the block and comes back this long before the first
// meeting of the next series.
const WEEKLY_LOOKAHEAD_DAYS = 45;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MAX_ITERATIONS = 5000;
const MAX_PER_EVENT = 400;
const WEEKDAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function isUpcoming(e: CalendarEvent, now: Date): boolean {
  if (e.allDay) return (e.end ?? e.start) >= dayInZone(now);
  return Date.parse(e.end ?? e.start) >= now.getTime();
}

type Phase = "past" | "in" | "after";

// Where an occurrence sits relative to the window [from, until].
function phaseIn(start: ICAL.Time, end: ICAL.Time | null, from: Date, until: Date): Phase {
  if (start.isDate) {
    const first = start.toString();
    const last = end ? previousDay(end.toString()) : first;
    if (last < dayInZone(from)) return "past";
    if (Date.parse(`${first}T00:00:00-03:00`) > until.getTime()) return "after";
    return "in";
  }
  const begins = start.toJSDate().getTime();
  const ends = end ? end.toJSDate().getTime() : begins;
  if (begins > until.getTime()) return "after";
  if (ends < from.getTime()) return "past";
  return "in";
}

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

export function parseCalendar(text: string, options: ParseOptions): ParsedCalendar {
  const { from, now, until, limit } = options;
  const weeklyUntil = new Date(now.getTime() + WEEKLY_LOOKAHEAD_DAYS * DAY_MS);

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

  const events: CalendarEvent[] = [];
  const weekly = new Map<string, WeeklyItem>();

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
      if (phaseIn(ev.startDate, end, from, until) === "in") {
        events.push(build(ev, ev, ev.startDate, end, isCancelled(ev) ? "cancelled" : undefined));
      }
      continue;
    }

    const routine = isRoutine(ev);
    let active = false;
    let accepted = 0;
    const iterator = ev.iterator();
    for (let i = 0; i < MAX_ITERATIONS && accepted < MAX_PER_EVENT; i++) {
      const next = iterator.next();
      if (!next) break;
      const details = ev.getOccurrenceDetails(next);
      const end = details.endDate ?? null;
      const phase = phaseIn(details.startDate, end, from, until);
      if (phase === "after") break;
      if (routine && phaseIn(details.startDate, end, now, weeklyUntil) === "in") active = true;
      if (phase === "past") continue;
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
          if (phaseIn(value, end, now, weeklyUntil) === "in") active = true;
          if (phaseIn(value, end, from, until) !== "in") continue;
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

  const sorted = events.sort((a, b) => toInstant(a) - toInstant(b)).slice(0, limit);
  return {
    events: sorted,
    upcoming: sorted.filter((e) => isUpcoming(e, now)),
    weekly: [...weekly.values()].sort(
      (a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time),
    ),
    today: dayInZone(now),
  };
}
