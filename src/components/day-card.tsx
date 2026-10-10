import type { CalendarEvent } from "@/lib/ical-parse";
import { dayLabel, eventWhen } from "@/lib/format";

const KIND_LABEL = {
  cancelled: { text: "Não haverá", className: "bg-brand text-white" },
  changed: { text: "Alterado", className: "bg-copper text-white" },
} as const;

// One block per day, with every event of that day inside it. `showDate` adds the date chip and
// weekday; leave it off when the date is already a heading right above the block.
export function DayCard({
  day,
  events,
  showDate = true,
}: {
  day: string;
  events: CalendarEvent[];
  showDate?: boolean;
}) {
  const label = dayLabel(day);
  return (
    <article className="flex gap-4 rounded-lg border border-border bg-surface p-4">
      {showDate && (
        <div
          className="flex w-16 shrink-0 flex-col items-center justify-center self-start rounded bg-brown/60 py-2 text-center"
          aria-hidden="true"
        >
          <span className="text-2xl font-bold leading-none">{label.dayNumber}</span>
          <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
            {label.month}
          </span>
        </div>
      )}
      <div className="min-w-0 flex-1 wrap-anywhere">
        {showDate && (
          <h3 className="mb-2 text-sm font-semibold text-muted">
            {label.weekday}, {label.dayNumber} de {label.month}
          </h3>
        )}
        <ul className="divide-y divide-border">
          {events.map((event) => {
            const kind = event.kind ? KIND_LABEL[event.kind] : null;
            return (
              <li key={event.id} className="py-3 first:pt-0 last:pb-0">
                {kind && (
                  <p className={`mb-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${kind.className}`}>
                    {kind.text}
                  </p>
                )}
                <h4 className="font-semibold">{event.title}</h4>
                <p className="text-sm text-muted">{eventWhen(event).timeLabel}</p>
                {event.location && <p className="text-sm text-muted">{event.location}</p>}
                {event.description && (
                  <p className="mt-2 whitespace-pre-line text-sm">{event.description}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
