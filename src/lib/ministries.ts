import { cacheLife } from "next/cache";
import { SITE } from "./config";
import { fetchDocHtml, parseDoc, type TextBlock } from "./google-doc";

export type Block = TextBlock;

export type Ministry = {
  title: string;
  slug: string;
  blocks: Block[];
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Each Heading 1 of the Google Doc becomes a ministry. What follows it, up to the next
// Heading 1, becomes the body (paragraphs and lists, in document order). Anything before the
// first Heading 1 (the document title) and smaller headings are ignored.
export function parseMinistries(html: string): Ministry[] {
  const ministries: Ministry[] = [];
  let current: Ministry | null = null;

  for (const block of parseDoc(html)) {
    if (block.type === "heading") {
      if (block.level !== 1) continue;
      current = { title: block.text, slug: slugify(block.text), blocks: [] };
      ministries.push(current);
    } else if (current) {
      current.blocks.push(block);
    }
  }
  return ministries;
}

export async function getMinistries(): Promise<Ministry[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  try {
    const html = await fetchDocHtml(SITE.ministriesDocId);
    return html ? parseMinistries(html) : [];
  } catch {
    return [];
  }
}

// "Liderança: ..." and "Líderes em transição: ..." lines get a muted style.
export function isLeadershipLine(text: string): boolean {
  return /^(lideran[çc]a|l[íi]deres?\b)/i.test(text);
}
