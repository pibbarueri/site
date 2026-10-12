import * as cheerio from "cheerio";

export type TextBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type DocBlock = TextBlock | { type: "heading"; level: 1 | 2 | 3; text: string };

function clean(text: string): string {
  return text.replace(/[​ ]/g, " ").replace(/\s+/g, " ").trim();
}

// Turns the HTML that Google Docs exports into a flat list of headings, paragraphs and lists,
// in document order. Formatting inside a paragraph (bold, italic, links) is dropped on purpose:
// the site decides how text looks.
export function parseDoc(html: string): DocBlock[] {
  const $ = cheerio.load(html);
  const blocks: DocBlock[] = [];

  $("body")
    .children()
    .each((_, el) => {
      if (el.type !== "tag") return;
      const heading = /^h([1-3])$/.exec(el.name);
      if (heading) {
        const text = clean($(el).text());
        if (text) blocks.push({ type: "heading", level: Number(heading[1]) as 1 | 2 | 3, text });
      } else if (el.name === "p") {
        const text = clean($(el).text());
        // Empty lines and the "_____" rules people use as separators are not content.
        if (!text || /^[_\-–—\s]+$/.test(text)) return;
        blocks.push({ type: "paragraph", text });
      } else if (el.name === "ul" || el.name === "ol") {
        const items = $(el)
          .find("li")
          .map((__, li) => clean($(li).text()))
          .get()
          .filter(Boolean);
        if (items.length) blocks.push({ type: "list", items });
      }
    });

  return blocks;
}

// Returns null when Google cannot be reached or the document is not shared, so callers can
// fall back to an empty state instead of failing the page.
export async function fetchDocHtml(docId: string): Promise<string | null> {
  const res = await fetch(`https://docs.google.com/document/d/${docId}/export?format=html`);
  return res.ok ? res.text() : null;
}
