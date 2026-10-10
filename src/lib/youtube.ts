import { cacheLife } from "next/cache";
import { SITE } from "./config";

export type Video = {
  id: string;
  title: string;
  publishedAt: string; // ISO
  thumbnail: string;
};

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decode(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|apos|#39);/g, (m) => ENTITIES[m] ?? m);
}

export function parseFeed(xml: string, limit: number): Video[] {
  const videos: Video[] = [];
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
    const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    if (!id || !title || !publishedAt) continue;
    videos.push({
      id,
      title: decode(title),
      publishedAt,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    });
    if (videos.length >= limit) break;
  }
  return videos;
}

export async function getVideos(limit = 12): Promise<Video[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.youtubeChannelId}`,
    );
    if (!res.ok) return [];
    return parseFeed(await res.text(), limit);
  } catch {
    return [];
  }
}
