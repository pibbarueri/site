import { dayInZone } from "./dates";
import { toInstant, type CalendarEvent } from "./calendar-types";

export type GridDay = {
  date: string; // YYYY-MM-DD
  inMonth: boolean;
};

const MAX_SPAN_DAYS = 31;

function shiftDay(day: string, delta: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

// Weeks (Sunday first) that cover the month "YYYY-MM", including the days of the neighbouring
// months that fill the first and last week.
export function buildMonth(month: string): GridDay[][] {
  const [year, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, m - 1, 1));
  const lastDay = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const leading = first.getUTCDay();
  const total = Math.ceil((leading + lastDay) / 7) * 7;
  const firstDay = first.toISOString().slice(0, 10);

  const days: GridDay[] = [];
  for (let i = 0; i < total; i++) {
    const date = shiftDay(firstDay, i - leading);
    days.push({ date, inMonth: date.startsWith(month) });
  }
  const weeks: GridDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

// Events by calendar day. An all-day event that spans several days appears on each of them.
export function groupByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const byDay = new Map<string, CalendarEvent[]>();
  const add = (day: string, event: CalendarEvent) => {
    byDay.set(day, [...(byDay.get(day) ?? []), event]);
  };
  for (const event of events) {
    if (event.allDay) {
      const last = event.end ?? event.start;
      for (let i = 0, day = event.start; day <= last && i < MAX_SPAN_DAYS; i++, day = shiftDay(day, 1)) {
        add(day, event);
      }
    } else {
      add(dayInZone(new Date(event.start)), event);
    }
  }
  for (const list of byDay.values()) list.sort((a, b) => toInstant(a) - toInstant(b));
  return byDay;
}
