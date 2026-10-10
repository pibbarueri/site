import type { CalendarEvent } from "@/lib/ical-parse";
import { eventWhen } from "@/lib/format";

const KIND_LABEL = {
  cancelled: { text: "Não haverá", className: "bg-brand text-white" },
  changed: { text: "Alterado", className: "bg-copper text-white" },
} as const;

export function EventCard({ event }: { event: CalendarEvent }) {
  const when = eventWhen(event);
  const label = event.kind ? KIND_LABEL[event.kind] : null;
  return (
    <article className="flex gap-4 rounded-lg border border-border bg-surface p-4">
      <div
        className="flex w-16 shrink-0 flex-col items-center justify-center self-start rounded bg-brown/60 py-2 text-center"
        aria-hidden="true"
      >
        <span className="text-2xl font-bold leading-none">{when.dayNumber}</span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
          {when.month}
        </span>
      </div>
      <div className="min-w-0 wrap-anywhere">
        {label && (
          <p
            className={`mb-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${label.className}`}
          >
            {label.text}
          </p>
        )}
        <h3 className="font-semibold">{event.title}</h3>
        <p className="text-sm text-muted">{when.summary}</p>
        {event.location && <p className="text-sm text-muted">{event.location}</p>}
        {event.description && (
          <p className="mt-2 whitespace-pre-line text-sm">{event.description}</p>
        )}
      </div>
    </article>
  );
}
