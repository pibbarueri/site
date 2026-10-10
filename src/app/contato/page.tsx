import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Container, PageTitle, secondaryButton, textLink } from "@/components/ui";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Primeira Igreja Batista em Barueri: endereço, email e redes sociais.",
};

export default function Contact() {
  return (
    <>
      <PageTitle title="Contato">
        Quer visitar a igreja, tirar uma dúvida ou conversar com a liderança? Escreva para nós.
      </PageTitle>

      <Container className="grid gap-10 py-10 sm:py-14 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-bold">Envie uma mensagem</h2>
          <ContactForm />
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-xl font-bold">Endereço</h2>
            <address className="not-italic leading-relaxed">
              {SITE.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-4 ${secondaryButton}`}
            >
              Abrir no mapa
            </a>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">Email</h2>
            <a href={`mailto:${SITE.email}`} className={textLink}>
              {SITE.email}
            </a>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">Redes sociais</h2>
            <ul className="space-y-2">
              <li>
                <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className={textLink}>
                  Instagram: @pibbarueri
                </a>
              </li>
              <li>
                <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" className={textLink}>
                  Facebook: @pibbarueri
                </a>
              </li>
              <li>
                <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer" className={textLink}>
                  YouTube: @pibbarueri
                </a>
              </li>
            </ul>
          </section>
        </div>
      </Container>
    </>
  );
}
