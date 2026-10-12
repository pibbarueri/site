import type { Metadata } from "next";
import { RichText } from "@/components/rich-text";
import { Container, PageTitle, textLink } from "@/components/ui";
import { SITE } from "@/lib/config";
import { getMinistries, isLeadershipLine } from "@/lib/ministries";

export const metadata: Metadata = {
  title: "Ministérios",
  description:
    "Conheça os ministérios da Primeira Igreja Batista em Barueri e quem lidera cada um.",
};

export default async function Ministries() {
  const ministries = await getMinistries();

  return (
    <>
      <PageTitle title="Ministérios">
        Cada ministério serve a igreja de um jeito. Se quiser participar de algum, fale com a
        liderança.
      </PageTitle>

      <Container className="py-10 sm:py-14">
        {ministries.length === 0 ? (
          <p className="text-muted">
            Não conseguimos carregar os ministérios agora. Tente de novo em alguns minutos ou
            escreva para{" "}
            <a href={`mailto:${SITE.email}`} className={textLink}>
              {SITE.email}
            </a>
            .
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {ministries.map((ministry) => (
              <article
                key={ministry.slug}
                id={ministry.slug}
                className={`scroll-mt-24 rounded-lg border border-border bg-surface p-6 wrap-anywhere ${
                  ministry.slug === "grupos-pequenos" ? "md:col-span-2" : ""
                }`}
              >
                <h2 className="border-l-4 border-brand pl-3 text-xl font-bold">{ministry.title}</h2>
                {ministry.blocks.map((block, i) =>
                  block.type === "list" ? (
                    <ul key={i} className="mt-4 list-disc space-y-1 pl-5 marker:text-brand">
                      {block.items.map((item) => (
                        <li key={item}>
                          <RichText text={item} />
                        </li>
                      ))}
                    </ul>
                  ) : isLeadershipLine(block.text) ? (
                    <p key={i} className="mt-4 border-t border-border pt-3 text-sm text-muted">
                      <RichText text={block.text} />
                    </p>
                  ) : (
                    <p key={i} className="mt-4 leading-relaxed text-neutral-200">
                      <RichText text={block.text} />
                    </p>
                  ),
                )}
              </article>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
