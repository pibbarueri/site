"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import type { Notice } from "@/lib/notices";

const SLIDE_MS = 8000;
const SWIPE_PX = 50;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const controlClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-border text-xl leading-none text-white transition-colors hover:border-white";

// The first slide is the regular first screen (`children`). Each notice is another slide. It
// advances on its own, stops while the pointer or keyboard focus is inside, and never advances
// for people who ask for reduced motion. A button pauses it for good, as WCAG asks of anything
// that moves by itself.
export function HomeCarousel({ notices, children }: { notices: Notice[]; children: ReactNode }) {
  const total = notices.length + 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  // The notices can change under us when the page refreshes, so keep the index in range.
  const current = index % total;
  const playing = !paused && !hovering && !focused && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % total), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [playing, current, total]);

  const go = (to: number) => setIndex(((to % total) + total) % total);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") go(current - 1);
    else if (e.key === "ArrowRight") go(current + 1);
  }

  function onFocus(e: FocusEvent<HTMLElement>) {
    // Only keyboard focus pauses it. A tap or click leaves focus on the button, which would
    // otherwise stop the carousel for good.
    setFocused(e.target.matches(":focus-visible"));
  }

  function onBlur(e: FocusEvent<HTMLElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const delta = e.changedTouches[0].clientX - start;
    if (Math.abs(delta) >= SWIPE_PX) go(delta < 0 ? current + 1 : current - 1);
  }

  const slideClass = (active: boolean) =>
    `col-start-1 row-start-1 transition-opacity duration-500 motion-reduce:transition-none ${
      active ? "opacity-100" : "pointer-events-none opacity-0"
    }`;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Destaques e avisos da igreja"
      className="border-b border-border"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <div
        className="grid"
        aria-live={playing ? "off" : "polite"}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={onTouchEnd}
      >
        <div
          role="group"
          aria-roledescription="slide"
          aria-label={`1 de ${total}`}
          inert={current !== 0}
          className={slideClass(current === 0)}
        >
          {children}
        </div>

        {notices.map((notice, i) => {
          const active = current === i + 1;
          return (
            <div
              key={notice.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 2} de ${total}: ${notice.title}`}
              inert={!active}
              className={`relative min-h-[26rem] overflow-hidden bg-black ${slideClass(active)}`}
            >
              {/* A tiny blurred copy fills the sides, so any proportion looks intentional. */}
              <Image
                src={notice.imageUrl}
                alt=""
                fill
                sizes="64px"
                className="scale-110 object-cover opacity-40 blur-2xl"
              />
              <a
                href={notice.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 block"
              >
                <Image
                  src={notice.imageUrl}
                  alt={notice.description ?? notice.title}
                  fill
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-contain"
                />
                <span className="sr-only"> (abre o aviso em tamanho real, em uma nova aba)</span>
              </a>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 flex items-center justify-center gap-2 border-t border-border bg-black/40 px-4 py-2">
        <button type="button" className={controlClass} aria-label="Slide anterior" onClick={() => go(current - 1)}>
          ‹
        </button>
        <div className="flex items-center">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={i === 0 ? "Ir para o início" : `Ir para o aviso ${i}: ${notices[i - 1].title}`}
              aria-current={i === current ? "true" : undefined}
              onClick={() => go(i)}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block h-2.5 w-2.5 rounded-full transition-colors ${
                  i === current ? "bg-white" : "bg-neutral-500"
                }`}
              />
            </button>
          ))}
        </div>
        <button type="button" className={controlClass} aria-label="Próximo slide" onClick={() => go(current + 1)}>
          ›
        </button>
        {!reducedMotion && (
          <button
            type="button"
            className={`${controlClass} ml-2`}
            aria-label={paused ? "Reproduzir os slides automaticamente" : "Pausar os slides automáticos"}
            onClick={() => setPaused(!paused)}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              {paused ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" />}
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
