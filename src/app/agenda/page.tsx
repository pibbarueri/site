import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { ScheduleList } from "@/components/schedule-list";
import { Container, PageTitle, secondaryButton } from "@/components/ui";
import { getCalendar } from "@/lib/calendar";
import { SITE } from "@/lib/config";
import { eventWhen, weeklyToSchedule } from "@/lib/format";
import type { CalendarEvent } from "@/lib/ical-parse";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Os próximos eventos e atividades da Primeira Igreja Batista em Barueri.",
};

export default async function Agenda() {
  const { events, weekly } = await getCalendar();

  const byMonth = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const month = eventWhen(event).monthYear;
    byMonth.set(month, [...(byMonth.get(month) ?? []), event]);
  }

  return (
    <>
      <PageTitle title="Agenda">
        Os próximos eventos da igreja. A agenda é atualizada pela secretaria.
      </PageTitle>

      <Container className="py-10 sm:py-14">
        {weekly.length > 0 && (
          <section className="mb-12 rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-bold">Toda semana</h2>
            <p className="mb-5 mt-1 text-sm text-muted">
              Estes encontros acontecem toda semana. Quando algum mudar de horário ou não
              acontecer, o aviso aparece na lista abaixo.
            </p>
            <ScheduleList items={weeklyToSchedule(weekly)} />
          </section>
        )}

        <div className="mb-8">
          <a
            href={SITE.calendarSubscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryButton}
          >
            Adicionar à minha agenda do Google
          </a>
        </div>

        {events.length === 0 ? (
          <p className="text-muted">
            Não há eventos especiais marcados por enquanto. Volte em breve.
          </p>
        ) : (
          <div className="space-y-10">
            {[...byMonth].map(([month, monthEvents]) => (
              <section key={month}>
                <h2 className="mb-4 border-b border-border pb-2 text-lg font-bold">{month}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {monthEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
