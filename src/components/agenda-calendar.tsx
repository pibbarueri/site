"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { EventCard } from "@/components/event-card";
import { buildMonth, groupByDay } from "@/lib/calendar-grid";
import type { CalendarEvent } from "@/lib/calendar-types";
import { addMonths, dayInZone, monthOf } from "@/lib/dates";

// The current month and the 11 after it, matching the window read in getCalendar.
const LAST_MONTH_OFFSET = 11;

const WEEKDAYS = [
  ["Dom", "Domingo"],
  ["Seg", "Segunda-feira"],
  ["Ter", "Terça-feira"],
  ["Qua", "Quarta-feira"],
  ["Qui", "Quinta-feira"],
  ["Sex", "Sexta-feira"],
  ["Sáb", "Sábado"],
] as const;

const monthFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});
const dayFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const formatMonth = (month: string) => capitalize(monthFormat.format(new Date(`${month}-01T12:00:00Z`)));
const formatDay = (day: string) => capitalize(dayFormat.format(new Date(`${day}T12:00:00Z`)));

const chipClass = (e: CalendarEvent) =>
  e.kind === "cancelled"
    ? "bg-brand text-white"
    : e.kind === "changed"
      ? "bg-copper text-white"
      : "border border-border bg-surface-raised text-neutral-100";

const dotClass = (e: CalendarEvent) =>
  e.kind === "cancelled" ? "bg-brand" : e.kind === "changed" ? "bg-copper" : "bg-neutral-300";

// The time is left out of the chip: the cell is narrow and the day panel below has it.
function chipText(e: CalendarEvent): string {
  return `${e.kind === "cancelled" ? "Não haverá: " : ""}${e.title}`;
}

// Today comes from the browser, but the server render (and the first client render) use the
// day the calendar was read, so the page can be prerendered and hydrates without a mismatch.
const subscribe = () => () => {};
function useToday(serverToday: string): string {
  return useSyncExternalStore(subscribe, () => dayInZone(new Date()), () => serverToday);
}

const navButton =
  "rounded border border-border px-3.5 py-1 text-xl font-semibold leading-none text-white transition-colors hover:border-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border";

export function AgendaCalendar({
  events,
  serverToday,
}: {
  events: CalendarEvent[];
  serverToday: string;
}) {
  const today = useToday(serverToday);
  const [offset, setOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const byDay = useMemo(() => groupByDay(events), [events]);
  const month = addMonths(monthOf(today), offset);
  const weeks = useMemo(() => buildMonth(month), [month]);

  const monthDays = weeks.flat().filter((d) => d.inMonth).map((d) => d.date);
  const defaultDay =
    monthDays.find((d) => d >= today && byDay.has(d)) ?? monthDays.find((d) => byDay.has(d)) ?? null;
  const activeDay = selectedDay && selectedDay.startsWith(month) ? selectedDay : defaultDay;
  const monthLabel = formatMonth(month);

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <button
            type="button"
            className={navButton}
            aria-label="Mês anterior"
            disabled={offset === 0}
            onClick={() => setOffset(offset - 1)}
          >
            ‹
          </button>
          <h2 className="text-lg font-bold" aria-live="polite">
            {monthLabel}
          </h2>
          <button
            type="button"
            className={navButton}
            aria-label="Próximo mês"
            disabled={offset === LAST_MONTH_OFFSET}
            onClick={() => setOffset(offset + 1)}
          >
            ›
          </button>
        </div>

        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr>
              {WEEKDAYS.map(([short, full]) => (
                <th
                  key={short}
                  scope="col"
                  className="border-b border-border py-2 text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  <abbr title={full} className="no-underline">
                    {short}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0].date}>
                {week.map((day) => {
                  if (!day.inMonth) {
                    return <td key={day.date} className="border-l border-t border-border bg-black/40 first:border-l-0" />;
                  }
                  const dayEvents = byDay.get(day.date) ?? [];
                  const isToday = day.date === today;
                  const isPast = day.date < today;
                  const number = (
                    <span
                      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-sm font-semibold ${
                        isToday ? "bg-brand text-white" : isPast ? "text-muted" : ""
                      }`}
                    >
                      {Number(day.date.slice(8))}
                    </span>
                  );
                  return (
                    <td key={day.date} className="border-l border-t border-border p-0 align-top first:border-l-0">
                      {dayEvents.length > 0 ? (
                        <button
                          type="button"
                          aria-pressed={day.date === activeDay}
                          aria-label={`${formatDay(day.date)}: ${dayEvents.length} ${dayEvents.length === 1 ? "evento" : "eventos"}`}
                          onClick={() => setSelectedDay(day.date)}
                          className={`flex min-h-16 w-full flex-col items-stretch gap-1 p-1.5 text-left transition-colors hover:bg-surface-raised md:min-h-32 ${
                            day.date === activeDay ? "bg-surface-raised ring-2 ring-inset ring-white" : ""
                          }`}
                        >
                          {number}
                          <span className="hidden space-y-1 md:block">
                            {dayEvents.slice(0, 3).map((e) => (
                              <span key={e.id} className={`block line-clamp-2 rounded px-1.5 py-0.5 text-xs leading-snug wrap-anywhere ${chipClass(e)}`}>
                                {chipText(e)}
                              </span>
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="block px-1 text-xs text-muted">+{dayEvents.length - 3} mais</span>
                            )}
                          </span>
                          <span className="flex gap-1 px-1 md:hidden" aria-hidden="true">
                            {dayEvents.slice(0, 3).map((e) => (
                              <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${dotClass(e)}`} />
                            ))}
                          </span>
                        </button>
                      ) : (
                        <div className="min-h-16 p-1.5 md:min-h-32">{number}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand" aria-hidden="true" />
          Não haverá
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-copper" aria-hidden="true" />
          Alterado
        </li>
      </ul>

      <section className="mt-8">
        {activeDay ? (
          <>
            <h3 className="mb-4 text-lg font-bold">{formatDay(activeDay)}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {(byDay.get(activeDay) ?? []).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted">Não há eventos marcados em {monthLabel.toLowerCase()}.</p>
        )}
      </section>
    </div>
  );
}
