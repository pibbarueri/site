import { cacheLife } from "next/cache";
import { DEFAULT_SCHEDULE, SITE, type ScheduleItem } from "./config";
import { parseCsv, rowsToRecords } from "./csv";

export type NewsItem = {
  date: string; // YYYY-MM-DD
  title: string;
  text: string;
  link?: string;
};

// Tab and column names stay in Portuguese: the church staff edits the spreadsheet.
async function readTab(tab: string): Promise<Record<string, string>[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SITE.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return rowsToRecords(parseCsv(await res.text()));
}

export async function getSchedule(): Promise<ScheduleItem[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  try {
    const rows = (await readTab("horarios")).filter((r) => r.dia && r.hora && r.nome);
    if (rows.length === 0) return DEFAULT_SCHEDULE;
    return rows.map((r) => ({
      day: r.dia,
      time: r.hora,
      name: r.nome,
      note: r.observacao || undefined,
    }));
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

// Accepts YYYY-MM-DD or DD/MM/YYYY. Returns YYYY-MM-DD or null.
function normalizeDate(value: string): string | null {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const br = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  return null;
}

function isInactive(value: string): boolean {
  const plain = value.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return /^(nao|n|0|false)$/i.test(plain);
}

export async function getNews(limit = 6): Promise<NewsItem[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  try {
    const items: NewsItem[] = [];
    for (const r of await readTab("novidades")) {
      if (!r.titulo || !r.texto) continue;
      if (isInactive(r.ativo ?? "")) continue;
      const date = normalizeDate(r.data ?? "");
      if (!date) continue;
      items.push({ date, title: r.titulo, text: r.texto, link: r.link || undefined });
    }
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  } catch {
    return [];
  }
}
