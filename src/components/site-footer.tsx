import Image from "next/image";
import { SITE } from "@/lib/config";
import { textLink } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="flex items-start gap-3">
          <Image src="/logo.png" alt="" width={56} height={60} />
          <p className="text-sm font-semibold leading-snug">{SITE.name}</p>
        </div>

        <div className="text-sm text-muted">
          <p className="mb-2 font-semibold text-white">Endereço</p>
          <address className="not-italic">
            {SITE.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className={`mt-2 inline-block ${textLink}`}>
            Ver no mapa
          </a>
        </div>

        <div className="text-sm text-muted">
          <p className="mb-2 font-semibold text-white">Fale com a gente</p>
          <a href={`mailto:${SITE.email}`} className={textLink}>
            {SITE.email}
          </a>
          <ul className="mt-3 flex gap-4">
            <li>
              <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" className={textLink}>
                Instagram
              </a>
            </li>
            <li>
              <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer" className={textLink}>
                Facebook
              </a>
            </li>
            <li>
              <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer" className={textLink}>
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted">
        © {SITE.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
