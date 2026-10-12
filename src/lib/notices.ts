import { cacheLife } from "next/cache";
import { SITE } from "./config";
import { listDriveFiles } from "./drive";
import { driveFileUrl, driveImageUrl } from "./drive-urls";

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

type DriveFile = { id?: unknown; name?: unknown; description?: unknown };

// The `files` of a Drive API response. Anything unexpected is skipped.
export function parseNotices(files: unknown[]): Notice[] {
  const notices: Notice[] = [];
  for (const file of files as DriveFile[]) {
    if (typeof file?.id !== "string" || typeof file.name !== "string") continue;
    const title = file.name.replace(/\.[A-Za-z0-9]{2,5}$/, "").trim() || "Aviso";
    const description = typeof file.description === "string" ? file.description.trim() : "";
    notices.push({
      id: file.id,
      title,
      description: description || undefined,
      imageUrl: driveImageUrl(file.id, `w${IMAGE_WIDTH}`),
      linkUrl: driveFileUrl(file.id),
    });
  }
  return notices;
}

// The images in the "Avisos" Drive folder, newest first. Without an API key, or when Google
// cannot be reached, there are no notices and the home page shows only its regular first screen.
export async function getNotices(): Promise<Notice[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  const files = await listDriveFiles({
    q: `'${SITE.noticesFolderId}' in parents and trashed = false and mimeType contains 'image/'`,
    orderBy: "createdTime desc",
    pageSize: MAX_NOTICES,
    fields: "files(id,name,description)",
  });
  return files ? parseNotices(files) : [];
}
