import { cacheLife } from "next/cache";
import { SITE } from "./config";
import { listDriveFiles } from "./drive";

// An album is a subfolder of the gallery folder. Photos are kept as Drive file ids only, which
// keeps what the browser downloads small.
export type Album = {
  id: string;
  title: string;
  photos: string[];
};

const FOLDER_MIME = "application/vnd.google-apps.folder";
const MAX_ALBUMS = 20;
const MAX_PHOTOS_PER_ALBUM = 150;

type DriveFile = { id?: unknown; name?: unknown };

export function parseAlbumFolders(files: unknown[]): { id: string; title: string }[] {
  const folders: { id: string; title: string }[] = [];
  for (const file of files as DriveFile[]) {
    if (typeof file?.id !== "string" || typeof file.name !== "string") continue;
    const title = file.name.trim();
    if (title) folders.push({ id: file.id, title });
  }
  return folders;
}

export function parsePhotoIds(files: unknown[]): string[] {
  return (files as DriveFile[]).flatMap((file) => (typeof file?.id === "string" ? [file.id] : []));
}

// The albums of the "Galeria de Fotos" Drive folder: newest album first, photos in file name
// order. Albums with no photos, or that Google fails to list, are left out. Without an API key,
// or when the folder is unset or unreachable, the gallery is empty.
export async function getGallery(): Promise<Album[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 86400 });

  if (!SITE.galleryFolderId) return [];
  const folders = await listDriveFiles({
    q: `'${SITE.galleryFolderId}' in parents and mimeType = '${FOLDER_MIME}' and trashed = false`,
    orderBy: "createdTime desc",
    pageSize: MAX_ALBUMS,
    fields: "files(id,name)",
  });
  if (!folders) return [];

  const albums = await Promise.all(
    parseAlbumFolders(folders).map(async ({ id, title }): Promise<Album> => {
      const files = await listDriveFiles({
        q: `'${id}' in parents and mimeType contains 'image/' and trashed = false`,
        orderBy: "name_natural",
        pageSize: MAX_PHOTOS_PER_ALBUM,
        fields: "files(id)",
      });
      return { id, title, photos: files ? parsePhotoIds(files) : [] };
    }),
  );
  return albums.filter((album) => album.photos.length > 0);
}
