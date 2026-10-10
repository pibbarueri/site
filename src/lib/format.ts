import { SITE } from "./config";
import type { CalendarEvent } from "./ical-parse";

const LOCALE = "pt-BR";

const weekdayFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: SITE.timeZone,
  weekday: "long",
});
const dayNumberFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: SITE.timeZone,
  day: "numeric",
});
const shortMonthFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: SITE.timeZone,
  month: "short",
});
const monthYearFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: SITE.timeZone,
  month: "long",
  year: "numeric",
});
const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: SITE.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const longDateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function toDate(e: Pick<CalendarEvent, "start" | "allDay">): Date {
  return new Date(e.allDay ? `${e.start}T12:00:00-03:00` : e.start);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// 18:30 -> "18h30"
export function shortTime(date: Date): string {
  return timeFormat.format(date).replace(":", "h");
}

export type EventWhen = {
  dayNumber: string;
  month: string;
  weekday: string;
  time: string | null;
  summary: string;
  monthYear: string;
};

export function eventWhen(e: CalendarEvent): EventWhen {
  const start = toDate(e);
  const dayNumber = dayNumberFormat.format(start);
  const month = shortMonthFormat.format(start).replace(".", "");
  const weekday = capitalize(weekdayFormat.format(start));
  const monthYear = capitalize(monthYearFormat.format(start));

  if (e.allDay) {
    const last = e.end ? toDate({ start: e.end, allDay: true }) : null;
    const summary = last
      ? `${weekday}, ${dayNumber} a ${dayNumberFormat.format(last)} de ${shortMonthFormat.format(last).replace(".", "")}`
      : `${weekday}, ${dayNumber} de ${month}`;
    return { dayNumber, month, weekday, time: null, summary, monthYear };
  }

  const time = shortTime(start);
  const end = e.end ? new Date(e.end) : null;
  const endTime = end ? shortTime(end) : null;
  const range = endTime && endTime !== time ? `${time} às ${endTime}` : time;
  return {
    dayNumber,
    month,
    weekday,
    time: range,
    summary: `${weekday}, ${dayNumber} de ${month}, ${range}`,
    monthYear,
  };
}

export function longDate(isoDate: string): string {
  return longDateFormat.format(new Date(`${isoDate}T12:00:00Z`));
}
