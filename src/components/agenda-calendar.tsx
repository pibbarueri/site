"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { DayCard } from "@/components/day-card";
import { buildMonth, groupByDay } from "@/lib/calendar-grid";
import type { CalendarEvent } from "@/lib/calendar-types";
import { addMonths, dayInZone, monthOf } from "@/lib/dates";

// The current month and the 11 after it, matching the window read in getCalendar.
const LAST_MONTH_OFFSET = 11;
// Dots under a day: more than this would not fit under the number.
const MAX_DOTS = 3;

const WEEKDAYS = [
  ["D", "Domingo"],
  ["S", "Segunda-feira"],
  ["T", "Terça-feira"],
  ["Q", "Quarta-feira"],
  ["Q", "Quinta-feira"],
  ["S", "Sexta-feira"],
  ["S", "Sábado"],
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

// The selected day is a white circle, so its dots flip to dark to stay visible.
function dotClass(e: CalendarEvent, selected: boolean): string {
  if (e.kind === "cancelled") return "bg-brand";
  if (e.kind === "changed") return "bg-copper";
  return selected ? "bg-black" : "bg-neutral-300";
}

// Today comes from the browser, but the server render (and the first client render) use the
// day the calendar was read, so the page can be prerendered and hydrates without a mismatch.
const subscribe = () => () => {};
function useToday(serverToday: string): string {
  return useSyncExternalStore(subscribe, () => dayInZone(new Date()), () => serverToday);
}

const navButton =
  "rounded-full border border-border px-3.5 py-1 text-xl font-semibold leading-none text-white transition-colors hover:border-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border";

const dayBase =
  "relative mx-auto flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold sm:h-12 sm:w-12 sm:text-base";

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
      <div className="rounded-lg border border-border bg-surface px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 flex items-center justify-between">
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

        <table className="w-full table-fixed border-separate border-spacing-y-1">
          <thead>
            <tr>
              {WEEKDAYS.map(([short, full], i) => (
                <th key={i} scope="col" className="pb-1 text-xs font-semibold uppercase text-muted">
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
                  if (!day.inMonth) return <td key={day.date} />;
                  const dayEvents = byDay.get(day.date) ?? [];
                  const isToday = day.date === today;
                  const isPast = day.date < today;
                  const isSelected = day.date === activeDay;
                  const number = Number(day.date.slice(8));
                  const ring = isToday ? "ring-2 ring-brand" : "";
                  const tone = isPast ? "text-muted" : "text-white";

                  if (dayEvents.length === 0) {
                    return (
                      <td key={day.date} className="p-0">
                        <span className={`${dayBase} ${ring} ${tone}`}>{number}</span>
                      </td>
                    );
                  }
                  return (
                    <td key={day.date} className="p-0">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={`${formatDay(day.date)}: ${dayEvents.length} ${dayEvents.length === 1 ? "evento" : "eventos"}`}
                        onClick={() => setSelectedDay(day.date)}
                        className={`${dayBase} ${ring} transition-colors ${
                          isSelected ? "bg-white text-black" : `${tone} hover:bg-surface-raised`
                        }`}
                      >
                        {number}
                        <span className="absolute bottom-1 flex gap-0.5" aria-hidden="true">
                          {dayEvents.slice(0, MAX_DOTS).map((e) => (
                            <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${dotClass(e, isSelected)}`} />
                          ))}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-neutral-300" aria-hidden="true" />
            Evento
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
            Não haverá
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-copper" aria-hidden="true" />
            Alterado
          </li>
        </ul>
      </div>

      <section className="mt-8">
        {activeDay ? (
          <>
            <h3 className="mb-4 text-lg font-bold">{formatDay(activeDay)}</h3>
            <DayCard day={activeDay} events={byDay.get(activeDay) ?? []} showDate={false} />
          </>
        ) : (
          <p className="text-muted">Não há eventos marcados em {monthLabel.toLowerCase()}.</p>
        )}
      </section>
    </div>
  );
}
