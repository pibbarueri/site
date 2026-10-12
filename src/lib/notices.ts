import { cacheLife } from "next/cache";
import { SITE } from "./config";

export type Notice = {
  id: string;
  // The file name without its extension. Used as the alt text unless the file has a description.
  title: string;
  description?: string;
  imageUrl: string;
  // Opens the file in the Drive viewer, so small text can be read at full size.
  linkUrl: string;
};

const MAX_NOTICES = 8;
const IMAGE_WIDTH = 1600;
// Overridable only so the reader can be tested against a local fake of the Drive API.
const DRIVE_API_URL = process.env.DRIVE_API_URL ?? "https://www.googleapis.com/drive/v3/files";

type DriveFile = { id?: unknown; name?: unknown; description?: unknown };

// Shape of the Drive API response for files.list. Anything unexpected is skipped.
export function parseNotices(data: unknown): Notice[] {
  const files = (data as { files?: DriveFile[] } | null)?.files;
  if (!Array.isArray(files)) return [];

  const notices: Notice[] = [];
  for (const file of files) {
    if (typeof file.id !== "string" || typeof file.name !== "string") continue;
    const title = file.name.replace(/\.[A-Za-z0-9]{2,5}$/, "").trim() || "Aviso";
    const description = typeof file.description === "string" ? file.description.trim() : "";
    notices.push({
      id: file.id,
      title,
      description: description || undefined,
      imageUrl: `https://lh3.googleusercontent.com/d/${file.id}=w${IMAGE_WIDTH}`,
      linkUrl: `https://drive.google.com/file/d/${file.id}/view`,
    });
  }
  return notices;
}

// The images in the "Avisos" Drive folder, newest first. Without an API key, or when Google
// cannot be reached, there are no notices and the home page shows only its regular first screen.
export async function getNotices(): Promise<Notice[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  const key = process.env.GOOGLE_DRIVE_API_KEY;
  // `vercel pull` writes variables marked as Sensitive as this literal during the build.
  if (!key || key === "[SENSITIVE]") return [];

  try {
    const params = new URLSearchParams({
      q: `'${SITE.noticesFolderId}' in parents and trashed = false and mimeType contains 'image/'`,
      orderBy: "createdTime desc",
      pageSize: String(MAX_NOTICES),
      fields: "files(id,name,description)",
    });
    const res = await fetch(`${DRIVE_API_URL}?${params}`, { headers: { "x-goog-api-key": key } });
    if (!res.ok) return [];
    return parseNotices(await res.json());
  } catch {
    return [];
  }
}
