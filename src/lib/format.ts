import { SITE, type ScheduleItem } from "./config";
import type { CalendarEvent, WeeklyItem } from "./ical-parse";

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
// Plain calendar days ("YYYY-MM-DD") are formatted at noon UTC, so no zone can shift them.
const dayWeekdayFormat = new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", weekday: "long" });
const dayNumberUtcFormat = new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", day: "numeric" });
const dayMonthUtcFormat = new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", month: "short" });

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
  // Only the time part: "18h30 às 20h30", "Dia inteiro" or "13 a 15 de nov".
  timeLabel: string;
  summary: string;
  monthYear: string;
};

// "13 a 15 de nov", or "30 de nov a 2 de dez" when the range crosses a month.
function dayRange(first: Date, last: Date): string {
  const firstMonth = shortMonthFormat.format(first).replace(".", "");
  const lastMonth = shortMonthFormat.format(last).replace(".", "");
  const firstNumber = dayNumberFormat.format(first);
  const lastNumber = dayNumberFormat.format(last);
  return firstMonth === lastMonth
    ? `${firstNumber} a ${lastNumber} de ${lastMonth}`
    : `${firstNumber} de ${firstMonth} a ${lastNumber} de ${lastMonth}`;
}

export function eventWhen(e: CalendarEvent): EventWhen {
  const start = toDate(e);
  const dayNumber = dayNumberFormat.format(start);
  const month = shortMonthFormat.format(start).replace(".", "");
  const weekday = capitalize(weekdayFormat.format(start));
  const monthYear = capitalize(monthYearFormat.format(start));

  if (e.allDay) {
    const last = e.end ? toDate({ start: e.end, allDay: true }) : null;
    const range = last ? dayRange(start, last) : null;
    return {
      dayNumber,
      month,
      weekday,
      timeLabel: range ?? "Dia inteiro",
      summary: range ? `${weekday}, ${range}` : `${weekday}, ${dayNumber} de ${month}`,
      monthYear,
    };
  }

  const time = shortTime(start);
  const end = e.end ? new Date(e.end) : null;
  const endTime = end ? shortTime(end) : null;
  const range = endTime && endTime !== time ? `${time} às ${endTime}` : time;
  return {
    dayNumber,
    month,
    weekday,
    timeLabel: range,
    summary: `${weekday}, ${dayNumber} de ${month}, ${range}`,
    monthYear,
  };
}

export type DayLabel = {
  dayNumber: string;
  month: string;
  weekday: string;
};

export function dayLabel(day: string): DayLabel {
  const date = new Date(`${day}T12:00:00Z`);
  return {
    dayNumber: dayNumberUtcFormat.format(date),
    month: dayMonthUtcFormat.format(date).replace(".", ""),
    weekday: capitalize(dayWeekdayFormat.format(date)),
  };
}

const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

// Weekly routine events from the calendar, in the same shape as the schedule list.
export function weeklyToSchedule(items: WeeklyItem[]): ScheduleItem[] {
  return items.map((item) => ({
    day: WEEKDAY_NAMES[item.weekday],
    time: item.time.replace(":", "h"),
    name: item.title,
    note: item.note,
  }));
}

export function longDate(isoDate: string): string {
  return longDateFormat.format(new Date(`${isoDate}T12:00:00Z`));
}
