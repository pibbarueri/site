import { RichText } from "@/components/rich-text";
import type { ScheduleItem } from "@/lib/config";

export function ScheduleList({ items }: { items: ScheduleItem[] }) {
  const groups = new Map<string, ScheduleItem[]>();
  for (const item of items) {
    groups.set(item.day, [...(groups.get(item.day) ?? []), item]);
  }

  return (
    <dl className="space-y-5">
      {[...groups].map(([day, dayItems]) => (
        <div key={day}>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{day}</dt>
          {dayItems.map((item) => (
            <dd key={`${item.time}-${item.name}`} className="mt-1 flex gap-3">
              <span className="w-14 shrink-0 font-semibold">{item.time}</span>
              <span className="min-w-0 wrap-anywhere">
                {item.name}
                {item.note && (
                  <span className="block text-sm text-muted">
                    <RichText text={item.note} />
                  </span>
                )}
              </span>
            </dd>
          ))}
        </div>
      ))}
    </dl>
  );
}
