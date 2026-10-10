import type { ReactNode } from "react";

export const primaryButton =
  "inline-flex items-center justify-center rounded bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover";

export const secondaryButton =
  "inline-flex items-center justify-center rounded border border-border px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white";

// Red is only an underline: as small text it fails contrast on the dark background.
export const textLink =
  "underline decoration-brand decoration-2 underline-offset-4 hover:text-white";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`}>{children}</div>
  );
}

export function Section({
  title,
  children,
  id,
  action,
}: {
  title: string;
  children: ReactNode;
  id?: string;
  action?: ReactNode;
}) {
  return (
    <section id={id} className="py-12 sm:py-16">
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
          {action}
        </div>
        {children}
      </Container>
    </section>
  );
}

export function PageTitle({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-[radial-gradient(ellipse_at_top,rgba(75,52,31,0.4),transparent_65%)]">
      <Container className="py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {children && <p className="mt-3 max-w-2xl text-base text-muted">{children}</p>}
      </Container>
    </div>
  );
}
