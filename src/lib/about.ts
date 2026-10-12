import { cacheLife } from "next/cache";
import { SITE } from "./config";
import { fetchDocHtml, parseDoc, type DocBlock, type TextBlock } from "./google-doc";

export type AboutSection = {
  title: string;
  blocks: TextBlock[];
};

// A card for a person (the pastor). The first paragraph is the name, then the role, then the
// short bio that is always visible. Everything after goes under "Mais detalhes".
export type Person = {
  heading: string;
  name: string;
  role?: string;
  summary?: string;
  details: TextBlock[];
};

export type About = {
  title: string;
  tagline?: string;
  intro: TextBlock[];
  sections: AboutSection[];
  people: Person[];
};

// A first paragraph longer than this is body text, not the short line under the title.
const MAX_TAGLINE_LENGTH = 140;
// A second paragraph longer than this is not a role like "Pastor titular".
const MAX_ROLE_LENGTH = 80;

function toText(block: DocBlock): TextBlock | null {
  return block.type === "heading" ? null : block;
}

function parsePerson(heading: string, blocks: TextBlock[]): Person | null {
  const body = [...blocks];
  const first = body[0];
  if (!first || first.type !== "paragraph") return null;
  body.shift();

  const name = first.text;
  let role: string | undefined;
  const second = body[0];
  if (second?.type === "paragraph" && second.text.length <= MAX_ROLE_LENGTH) {
    role = second.text;
    body.shift();
  }
  let summary: string | undefined;
  const third = body[0];
  if (third?.type === "paragraph") {
    summary = third.text;
    body.shift();
  }
  return { heading, name, role, summary, details: body };
}

// The first Heading 1 is the page: the text under it is the tagline and intro, and each
// Heading 2 starts a section. Every later Heading 1 is a person card.
export function parseAbout(html: string): About | null {
  const groups: { title: string; blocks: DocBlock[] }[] = [];
  for (const block of parseDoc(html)) {
    if (block.type === "heading" && block.level === 1) {
      groups.push({ title: block.text, blocks: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].blocks.push(block);
    }
  }
  if (groups.length === 0) return null;

  const [page, ...personGroups] = groups;
  const head: TextBlock[] = [];
  const sections: AboutSection[] = [];
  let current: AboutSection | null = null;
  for (const block of page.blocks) {
    if (block.type === "heading") {
      if (block.level === 2) {
        current = { title: block.text, blocks: [] };
        sections.push(current);
      }
      continue;
    }
    (current ? current.blocks : head).push(block);
  }

  let tagline: string | undefined;
  if (head[0]?.type === "paragraph" && head[0].text.length <= MAX_TAGLINE_LENGTH) {
    tagline = head[0].text;
    head.shift();
  }

  const people = personGroups
    .map((g) => parsePerson(g.title, g.blocks.map(toText).filter((b): b is TextBlock => b !== null)))
    .filter((p): p is Person => p !== null);

  return { title: page.title, tagline, intro: head, sections, people };
}

export async function getAbout(): Promise<About | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  try {
    const html = await fetchDocHtml(SITE.aboutDocId);
    return html ? parseAbout(html) : null;
  } catch {
    return null;
  }
}
