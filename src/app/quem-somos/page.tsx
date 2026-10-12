import type { Metadata } from "next";
import { RichText } from "@/components/rich-text";
import { Container, PageTitle, textLink } from "@/components/ui";
import { getAbout, type Person } from "@/lib/about";
import { SITE } from "@/lib/config";
import type { TextBlock } from "@/lib/google-doc";

export const metadata: Metadata = {
  title: "Quem somos",
  description:
    "Conheça a história, a fé e o pastor da Primeira Igreja Batista em Barueri, fundada em 1965.",
};

function Blocks({ blocks, className = "" }: { blocks: TextBlock[]; className?: string }) {
  return blocks.map((block, i) =>
    block.type === "list" ? (
      <ul key={i} className={`list-disc space-y-1 pl-5 marker:text-brand ${className}`}>
        {block.items.map((item) => (
          <li key={item}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    ) : (
      <p key={i} className={className}>
        <RichText text={block.text} />
      </p>
    ),
  );
}

function PersonCard({ person }: { person: Person }) {
  return (
    <section className="border-t border-border py-8">
      <h2 className="text-xl font-bold sm:text-2xl">{person.heading}</h2>
      <div className="mt-4 rounded-lg border border-border bg-surface p-6 wrap-anywhere">
        <h3 className="text-lg font-semibold">{person.name}</h3>
        {person.role && <p className="text-sm text-muted">{person.role}</p>}
        {person.summary && (
          <p className="mt-4 leading-relaxed text-neutral-200">
            <RichText text={person.summary} />
          </p>
        )}
        {person.details.length > 0 && (
          <details className="mt-4 border-t border-border pt-4">
            <summary className="cursor-pointer text-sm font-semibold underline decoration-brand decoration-2 underline-offset-4 hover:text-white">
              Mais detalhes
            </summary>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-200">
              <Blocks blocks={person.details} />
            </div>
          </details>
        )}
      </div>
    </section>
  );
}

export default async function AboutUs() {
  const about = await getAbout();

  if (!about) {
    return (
      <>
        <PageTitle title="Quem somos" />
        <Container className="max-w-3xl py-10">
          <p className="text-muted">
            Não conseguimos carregar esta página agora. Tente de novo em alguns minutos ou escreva
            para{" "}
            <a href={`mailto:${SITE.email}`} className={textLink}>
              {SITE.email}
            </a>
            .
          </p>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageTitle title={about.title}>{about.tagline}</PageTitle>

      <Container className="max-w-3xl py-8 sm:py-12">
        {about.intro.length > 0 && (
          <div className="space-y-4 text-lg leading-relaxed wrap-anywhere">
            <Blocks blocks={about.intro} />
          </div>
        )}

        {about.sections.map((section) => (
          <section key={section.title} className="py-8">
            <h2 className="text-xl font-bold sm:text-2xl">{section.title}</h2>
            <div className="mt-3 space-y-4 leading-relaxed text-neutral-200 wrap-anywhere">
              <Blocks blocks={section.blocks} />
            </div>
          </section>
        ))}

        {about.people.map((person) => (
          <PersonCard key={`${person.heading}-${person.name}`} person={person} />
        ))}
      </Container>
    </>
  );
}
