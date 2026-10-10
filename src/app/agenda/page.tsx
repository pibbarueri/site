import type { Metadata } from "next";
import { AgendaCalendar } from "@/components/agenda-calendar";
import { ScheduleList } from "@/components/schedule-list";
import { Container, PageTitle, secondaryButton } from "@/components/ui";
import { getCalendar } from "@/lib/calendar";
import { SITE } from "@/lib/config";
import { weeklyToSchedule } from "@/lib/format";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Os próximos eventos e atividades da Primeira Igreja Batista em Barueri.",
};

export default async function Agenda() {
  const { events, weekly, today } = await getCalendar();

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
              acontecer, o aviso aparece no calendário abaixo.
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

        <AgendaCalendar events={events} serverToday={today} />
      </Container>
    </>
  );
}
