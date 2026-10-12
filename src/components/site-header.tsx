"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/quem-somos", label: "Quem somos" },
  { href: "/ministerios", label: "Ministérios" },
  { href: "/agenda", label: "Agenda" },
  { href: "/mensagens", label: "Mensagens" },
  { href: "/galeria", label: "Galeria" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader() {
  const pathname = usePathname();
  // Remembers the page where the menu was opened, so it closes itself on navigation.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const isOpen = openedAt === pathname;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-black/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="PIB Barueri, página inicial">
          <Image src="/logo.png" alt="" width={44} height={47} priority />
          <span className="text-sm font-semibold leading-tight tracking-wide">
            PIB
            <br />
            Barueri
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`rounded px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                    isActive(l.href)
                      ? "text-white underline decoration-brand decoration-2 underline-offset-8"
                      : "text-muted"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="rounded border border-border px-3 py-2 text-sm font-medium md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          onClick={() => setOpenedAt(isOpen ? null : pathname)}
        >
          {isOpen ? "Fechar" : "Menu"}
        </button>
      </div>

      {isOpen && (
        <nav id="mobile-menu" aria-label="Principal" className="border-t border-border md:hidden">
          <ul className="mx-auto flex w-full max-w-5xl flex-col px-4 py-2 sm:px-6">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`block border-l-2 py-3 pl-4 text-base font-medium ${
                    isActive(l.href) ? "border-brand text-white" : "border-transparent text-muted"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
