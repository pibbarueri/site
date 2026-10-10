import * as cheerio from "cheerio";
import { cacheLife } from "next/cache";
import { SITE } from "./config";

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type Ministry = {
  title: string;
  slug: string;
  blocks: Block[];
};

function clean(text: string): string {
  return text.replace(/[​ ]/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Each Heading 1 of the Google Doc becomes a ministry. What follows it, up to the next
// Heading 1, becomes the body (paragraphs and lists, in document order).
export function parseMinistries(html: string): Ministry[] {
  const $ = cheerio.load(html);
  const ministries: Ministry[] = [];
  let current: Ministry | null = null;

  $("body")
    .children()
    .each((_, el) => {
      if (el.type !== "tag") return;
      if (el.name === "h1") {
        const title = clean($(el).text());
        current = title ? { title, slug: slugify(title), blocks: [] } : null;
        if (current) ministries.push(current);
        return;
      }
      if (!current) return;
      if (el.name === "p") {
        const text = clean($(el).text());
        if (!text || /^[_\-–—\s]+$/.test(text)) return;
        current.blocks.push({ type: "paragraph", text });
      } else if (el.name === "ul" || el.name === "ol") {
        const items = $(el)
          .find("li")
          .map((__, li) => clean($(li).text()))
          .get()
          .filter(Boolean);
        if (items.length) current.blocks.push({ type: "list", items });
      }
    });

  return ministries;
}

export async function getMinistries(): Promise<Ministry[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  try {
    const res = await fetch(
      `https://docs.google.com/document/d/${SITE.ministriesDocId}/export?format=html`,
    );
    if (!res.ok) return [];
    return parseMinistries(await res.text());
  } catch {
    return [];
  }
}

// "Liderança: ..." and "Líderes em transição: ..." lines get a muted style.
export function isLeadershipLine(text: string): boolean {
  return /^(lideran[çc]a|l[íi]deres?\b)/i.test(text);
}
