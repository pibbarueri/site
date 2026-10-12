import type { Metadata } from "next";
import { RichText } from "@/components/rich-text";
import { Container, PageTitle, secondaryButton, textLink } from "@/components/ui";
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

        <section aria-labelledby="documentos" className="mt-8 rounded-lg border border-border bg-surface p-6">
          <h2 id="documentos" className="text-lg font-bold">
            Nossos documentos
          </h2>
          <p className="mt-1 text-sm text-muted">Leia na íntegra. O arquivo abre em uma nova aba.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {SITE.documents.map((doc) => (
              <a
                key={doc.url}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${secondaryButton} gap-3`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                  <path d="M14 3v5h5M9 13h6M9 17h6" />
                </svg>
                {doc.label}
                <span className="text-xs font-medium text-muted">PDF</span>
                <span className="sr-only">(abre em uma nova aba)</span>
              </a>
            ))}
          </div>
        </section>

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
