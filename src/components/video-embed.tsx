"use client";

import Image from "next/image";
import { useState } from "react";

// Shows the thumbnail first and only loads the YouTube player on click. The page stays light,
// nothing from YouTube loads until someone wants to watch, and a blocked embed never leaves a
// blank box behind the thumbnail.
export function VideoEmbed({
  id,
  title,
  thumbnail,
}: {
  id: string;
  title: string;
  thumbnail: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block h-full w-full"
      aria-label={`Assistir: ${title}`}
    >
      <Image
        src={thumbnail}
        alt=""
        fill
        sizes="(min-width: 768px) 60vw, 100vw"
        className="object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/10">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white">
          <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
