"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { driveImageUrl } from "@/lib/drive-urls";
import type { Album } from "@/lib/gallery";

const THUMB_SIZE = "w448-h336-c";
const FULL_SIZE = "w1920";
// Photos shown in an album's row. The album modal has all of them.
const ROW_PHOTOS = 12;
const SWIPE_PX = 50;

type PhotoView = { album: number; index: number; fromAlbum: boolean };

const plural = (n: number) => `${n} ${n === 1 ? "foto" : "fotos"}`;

const roundButton =
  "flex shrink-0 items-center justify-center rounded-full border border-border text-white transition-colors hover:border-white";

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// A native <dialog>: the browser traps focus, makes the page behind inert, closes on Escape and
// restores focus. Two of them can be open at once and the last one opened is on top, so closing
// a photo that was opened from an album lands back on the album with no extra code.
function Modal({
  open,
  onClose,
  label,
  className,
  onKeyDown,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  className: string;
  onKeyDown?: (e: KeyboardEvent<HTMLDialogElement>) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={className}
      onClose={onClose}
      onKeyDown={onKeyDown}
      // The backdrop is part of the dialog element, so a click on it targets the dialog itself.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Images only load while the modal is open. */}
      {open ? children : null}
    </dialog>
  );
}

function PhotoButton({
  albumTitle,
  id,
  number,
  onClick,
  className,
}: {
  albumTitle: string;
  id: string;
  number: number;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Ampliar a foto ${number} do álbum ${albumTitle}`}
      className={`group relative block overflow-hidden rounded bg-surface-raised ${className}`}
    >
      {/* Google resizes and caches these, so Vercel's image optimizer (which has a monthly
          quota) is skipped for a gallery that can have hundreds of photos. */}
      <Image
        unoptimized
        src={driveImageUrl(id, THUMB_SIZE)}
        alt=""
        fill
        sizes="224px"
        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
      />
    </button>
  );
}

function AlbumRow({
  album,
  onOpenAlbum,
  onOpenPhoto,
}: {
  album: Album;
  onOpenAlbum: () => void;
  onOpenPhoto: (index: number) => void;
}) {
  const scroller = useRef<HTMLUListElement>(null);
  // Which edge of the row is in view, so the arrows only show where there is more to scroll to.
  const [edges, setEdges] = useState({ start: true, end: false });
  const shown = album.photos.slice(0, ROW_PHOTOS);
  const hasMore = album.photos.length > ROW_PHOTOS;

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges]);

  function scrollRow(direction: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  }

  const chevron = `${roundButton} absolute top-[calc(50%-0.75rem)] z-10 hidden h-11 w-11 -translate-y-1/2 border-white/30 bg-black/70 text-xl md:flex`;

  return (
    <section aria-labelledby={`album-${album.id}`} className="py-6">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 id={`album-${album.id}`} className="text-xl font-bold sm:text-2xl">
          <button
            type="button"
            onClick={onOpenAlbum}
            className="text-left underline-offset-4 hover:underline hover:decoration-brand hover:decoration-2"
          >
            {album.title}
          </button>{" "}
          <span className="whitespace-nowrap text-sm font-normal text-muted">{plural(album.photos.length)}</span>
        </h2>
        <button
          type="button"
          onClick={onOpenAlbum}
          aria-label={`Ver álbum ${album.title}`}
          className="shrink-0 text-sm font-medium underline decoration-brand decoration-2 underline-offset-4 hover:text-white"
        >
          Ver álbum
        </button>
      </div>

      <div className="relative">
        <ul
          ref={scroller}
          onScroll={updateEdges}
          className="flex snap-x gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]"
        >
          {shown.map((id, i) => (
            <li key={`${id}-${i}`} className="w-48 shrink-0 snap-start sm:w-56">
              <PhotoButton
                albumTitle={album.title}
                id={id}
                number={i + 1}
                onClick={() => onOpenPhoto(i)}
                className="aspect-[4/3] w-full"
              />
            </li>
          ))}
          {hasMore && (
            <li className="w-48 shrink-0 snap-start sm:w-56">
              <button
                type="button"
                onClick={onOpenAlbum}
                className="flex aspect-[4/3] w-full items-center justify-center rounded border border-border bg-surface px-3 text-center text-sm font-semibold transition-colors hover:border-white"
              >
                Ver as {album.photos.length} fotos
              </button>
            </li>
          )}
        </ul>
        {/* Mouse users get arrows. Keyboard and touch users scroll with Tab, the arrow keys or a swipe. */}
        {!edges.start && (
          <button type="button" aria-hidden="true" tabIndex={-1} className={`${chevron} left-1`} onClick={() => scrollRow(-1)}>
            ‹
          </button>
        )}
        {!edges.end && (
          <button type="button" aria-hidden="true" tabIndex={-1} className={`${chevron} right-1`} onClick={() => scrollRow(1)}>
            ›
          </button>
        )}
      </div>
    </section>
  );
}

function PhotoViewer({
  album,
  index,
  fromAlbum,
  onClose,
  onStep,
}: {
  album: Album;
  index: number;
  fromAlbum: boolean;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const total = album.photos.length;
  const touchStartX = useRef<number | null>(null);

  // Load the neighbours ahead of time so the arrows feel instant.
  useEffect(() => {
    for (const neighbour of [index - 1, index + 1]) {
      const id = album.photos[neighbour];
      if (id) new window.Image().src = driveImageUrl(id, FULL_SIZE);
    }
  }, [album, index]);

  const arrow = `${roundButton} absolute top-1/2 z-10 h-12 w-12 -translate-y-1/2 border-white/30 bg-black/60 text-2xl disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/30`;

  return (
    <div
      className="relative h-full w-full"
      onTouchStart={(e: TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e: TouchEvent) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start === null) return;
        const delta = e.changedTouches[0].clientX - start;
        if (Math.abs(delta) >= SWIPE_PX) onStep(delta < 0 ? 1 : -1);
      }}
    >
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 bg-gradient-to-b from-black/80 to-transparent px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label={fromAlbum ? "Voltar ao álbum" : "Fechar foto"}
          className={`${roundButton} h-11 w-11 border-white/30 bg-black/60`}
        >
          <CloseIcon />
        </button>
        <p aria-live="polite" className="min-w-0 truncate text-sm font-medium">
          {album.title} · {index + 1} de {total}
        </p>
      </div>

      <Image
        unoptimized
        src={driveImageUrl(album.photos[index], FULL_SIZE)}
        alt={`${album.title}, foto ${index + 1} de ${total}`}
        fill
        sizes="100vw"
        priority
        className="object-contain"
      />

      <button type="button" aria-label="Foto anterior" disabled={index === 0} onClick={() => onStep(-1)} className={`${arrow} left-3`}>
        ‹
      </button>
      <button type="button" aria-label="Próxima foto" disabled={index === total - 1} onClick={() => onStep(1)} className={`${arrow} right-3`}>
        ›
      </button>
    </div>
  );
}

export function PhotoGallery({ albums }: { albums: Album[] }) {
  // The album modal and the photo modal are independent: a photo opened from an album stacks on
  // top of it, a photo opened from a row stands alone.
  const [albumIndex, setAlbumIndex] = useState<number | null>(null);
  const [view, setView] = useState<PhotoView | null>(null);

  const openAlbum = albumIndex !== null ? albums[albumIndex] : undefined;
  const viewAlbum = view ? albums[view.album] : undefined;
  const photoOpen = view !== null && viewAlbum !== undefined && view.index < viewAlbum.photos.length;

  function step(delta: number) {
    setView((current) => {
      if (!current) return current;
      const total = albums[current.album]?.photos.length ?? 0;
      return { ...current, index: Math.min(Math.max(current.index + delta, 0), Math.max(total - 1, 0)) };
    });
  }

  function onPhotoKeyDown(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  }

  return (
    <>
      <div className="divide-y divide-border">
        {albums.map((album, albumPosition) => (
          <AlbumRow
            key={album.id}
            album={album}
            onOpenAlbum={() => setAlbumIndex(albumPosition)}
            onOpenPhoto={(index) => setView({ album: albumPosition, index, fromAlbum: false })}
          />
        ))}
      </div>

      <Modal
        open={openAlbum !== undefined}
        onClose={() => setAlbumIndex(null)}
        label={openAlbum ? `Álbum ${openAlbum.title}` : "Álbum"}
        className="m-auto max-h-[90dvh] w-[min(64rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-lg border border-border bg-surface p-0 text-foreground backdrop:bg-black/80 open:flex"
      >
        {openAlbum && (
          <>
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold">{openAlbum.title}</h2>
                <p className="text-sm text-muted">{plural(openAlbum.photos.length)}</p>
              </div>
              <button
                type="button"
                onClick={() => setAlbumIndex(null)}
                aria-label="Fechar álbum"
                className={`${roundButton} h-10 w-10`}
              >
                <CloseIcon />
              </button>
            </header>
            <div className="overflow-y-auto p-3 sm:p-4">
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {openAlbum.photos.map((id, i) => (
                  <li key={`${id}-${i}`}>
                    <PhotoButton
                      albumTitle={openAlbum.title}
                      id={id}
                      number={i + 1}
                      onClick={() => setView({ album: albumIndex as number, index: i, fromAlbum: true })}
                      className="aspect-[4/3] w-full"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={photoOpen}
        onClose={() => setView(null)}
        label="Foto ampliada"
        onKeyDown={onPhotoKeyDown}
        className="m-0 h-dvh max-h-none w-screen max-w-none flex-col border-0 bg-black p-0 text-foreground backdrop:bg-black open:flex"
      >
        {photoOpen && view && viewAlbum && (
          <PhotoViewer
            album={viewAlbum}
            index={view.index}
            fromAlbum={view.fromAlbum}
            onClose={() => setView(null)}
            onStep={step}
          />
        )}
      </Modal>
    </>
  );
}
