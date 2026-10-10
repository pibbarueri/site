import type { Metadata } from "next";
import Image from "next/image";
import { Container, PageTitle, secondaryButton } from "@/components/ui";
import { SITE } from "@/lib/config";
import { longDate } from "@/lib/format";
import { getVideos } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Mensagens",
  description: "Assista às mensagens da Primeira Igreja Batista em Barueri.",
};

export default async function Messages() {
  const videos = await getVideos(12);

  return (
    <>
      <PageTitle title="Mensagens">
        As mensagens mais recentes dos nossos cultos, direto do nosso canal no YouTube.
      </PageTitle>

      <Container className="py-10 sm:py-14">
        {videos.length === 0 ? (
          <p className="text-muted">
            Não conseguimos carregar os vídeos agora. Você pode assistir direto no nosso canal.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <li key={video.id}>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-white"
                >
                  <div className="aspect-video overflow-hidden bg-black">
                    <Image
                      src={video.thumbnail}
                      alt=""
                      width={480}
                      height={360}
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4 wrap-anywhere">
                    <h2 className="font-semibold leading-snug">{video.title}</h2>
                    <p className="mt-2 text-sm text-muted">
                      {longDate(video.publishedAt.slice(0, 10))}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <a
            href={SITE.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryButton}
          >
            Ver todas no YouTube
          </a>
        </div>
      </Container>
    </>
  );
}
