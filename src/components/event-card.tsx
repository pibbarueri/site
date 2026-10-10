import type { CalendarEvent } from "@/lib/ical-parse";
import { eventWhen } from "@/lib/format";

export function EventCard({ event }: { event: CalendarEvent }) {
  const when = eventWhen(event);
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
