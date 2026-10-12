import type { Metadata } from "next";
import { PhotoGallery } from "@/components/photo-gallery";
import { Container, PageTitle, textLink } from "@/components/ui";
import { SITE } from "@/lib/config";
import { getGallery } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Galeria",
  description: "Fotos da Primeira Igreja Batista em Barueri, reunidas por álbum.",
};

export default async function GalleryPage() {
  const albums = await getGallery();

  return (
    <>
      <PageTitle title="Galeria">Momentos da vida da igreja, reunidos por álbum.</PageTitle>

      <Container className="py-6 sm:py-10">
        {albums.length === 0 ? (
          <p className="py-6 text-muted">
            Em breve teremos fotos por aqui. Enquanto isso, acompanhe a igreja no{" "}
            <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className={textLink}>
              Instagram
            </a>
            .
          </p>
        ) : (
          <PhotoGallery albums={albums} />
        )}
      </Container>
    </>
  );
}
