import Image from "next/image";
import Link from "next/link";
import { DayCard } from "@/components/day-card";
import { ScheduleList } from "@/components/schedule-list";
import { VideoEmbed } from "@/components/video-embed";
import { Container, primaryButton, Section, secondaryButton, textLink } from "@/components/ui";
import { getCalendar } from "@/lib/calendar";
import { groupByDay } from "@/lib/calendar-grid";
import { SITE } from "@/lib/config";
import { longDate } from "@/lib/format";
import { getNews, getSchedule } from "@/lib/sheet";
import { getVideos } from "@/lib/youtube";

export default async function Home() {
  const [schedule, calendar, videos, news] = await Promise.all([
    getSchedule(),
    getCalendar(),
    getVideos(1),
    getNews(3),
  ]);
  // One block per day. A multi-day event also adds days that already passed, so skip those.
  const days = [...groupByDay(calendar.upcoming)]
    .filter(([day]) => day >= calendar.today)
    .slice(0, 3);
  const latestVideo = videos[0];

  return (
    <>
      <section className="border-b border-border bg-[radial-gradient(ellipse_at_top,rgba(75,52,31,0.5),transparent_65%)]">
        <Container className="flex flex-col items-center py-16 text-center sm:py-24">
          <Image src="/logo.png" alt="" width={140} height={150} priority />
          <h1 className="mt-8 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
            {SITE.name}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Será um prazer receber você, seus familiares e amigos no próximo encontro!
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className={primaryButton}>
              Como chegar
            </a>
            <Link href="/agenda" className={secondaryButton}>
              Ver a agenda
            </Link>
          </div>
        </Container>
      </section>

      <Section title="Venha nos visitar" id="visite">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-4 text-lg font-semibold">Horários</h3>
            <ScheduleList items={schedule} />
          </div>
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-4 text-lg font-semibold">Endereço</h3>
            <address className="not-italic leading-relaxed">
              {SITE.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                Abrir no mapa
              </a>
            </div>
            <p className="mt-5 text-sm text-muted">
              Dúvidas? Escreva para{" "}
              <a href={`mailto:${SITE.email}`} className={textLink}>
                {SITE.email}
              </a>
              .
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Próximos eventos"
        action={
          <Link href="/agenda" className={`text-sm font-medium ${textLink}`}>
            Ver a agenda completa
          </Link>
        }
      >
        {days.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {days.map(([day, dayEvents]) => (
              <DayCard key={day} day={day} events={dayEvents} />
            ))}
          </div>
        ) : (
          <p className="text-muted">
            Em breve teremos novos eventos por aqui. Enquanto isso, acompanhe a igreja no{" "}
            <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className={textLink}>
              Instagram
            </a>
            .
          </p>
        )}
      </Section>

      {latestVideo && (
        <Section
          title="Última mensagem"
          action={
            <Link href="/mensagens" className={`text-sm font-medium ${textLink}`}>
              Ver todas as mensagens
            </Link>
          }
        >
          <div className="grid gap-6 md:grid-cols-5">
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-black md:col-span-3">
              <VideoEmbed
                id={latestVideo.id}
                title={latestVideo.title}
                thumbnail={latestVideo.thumbnail}
              />
            </div>
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold leading-snug">{latestVideo.title}</h3>
              <p className="mt-2 text-sm text-muted">{longDate(latestVideo.publishedAt.slice(0, 10))}</p>
              <a
                href={`https://www.youtube.com/watch?v=${latestVideo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-5 ${secondaryButton}`}
              >
                Assistir no YouTube
              </a>
            </div>
          </div>
        </Section>
      )}

      {news.length > 0 && (
        <Section title="Novidades">
          <div className="grid gap-4 md:grid-cols-3">
            {news.map((item) => (
              <article
                key={`${item.date}-${item.title}`}
                className="rounded-lg border border-border bg-surface p-5 wrap-anywhere"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {longDate(item.date)}
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-snug">{item.title}</h3>
                <p className="mt-2 whitespace-pre-line text-sm">{item.text}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className={`mt-4 inline-block text-sm font-medium ${textLink}`}>
                    Saiba mais
                  </a>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
