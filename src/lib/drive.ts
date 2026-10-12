// Overridable only so the readers can be tested against a local fake of the Drive API.
const DRIVE_API_URL = process.env.DRIVE_API_URL ?? "https://www.googleapis.com/drive/v3/files";

export type DriveQuery = {
  q: string;
  orderBy: string;
  pageSize: number;
  fields: string;
};

// `files.list` of the Drive API. Returns null when there is no usable key or Google answers with
// an error, so every caller can fall back to "nothing to show" the same way.
export async function listDriveFiles(query: DriveQuery): Promise<unknown[] | null> {
  const key = process.env.GOOGLE_DRIVE_API_KEY;
  // `vercel pull` writes variables of type Secret (formerly Sensitive) as this literal during
  // the build, so the key is missing there. See docs/drive-api-setup.md, "Config ou Secret".
  if (!key || key === "[SENSITIVE]") return null;

  try {
    const params = new URLSearchParams({
      q: query.q,
      orderBy: query.orderBy,
      pageSize: String(query.pageSize),
      fields: query.fields,
    });
    const res = await fetch(`${DRIVE_API_URL}?${params}`, { headers: { "x-goog-api-key": key } });
    if (!res.ok) return null;
    const data = (await res.json()) as { files?: unknown };
    return Array.isArray(data.files) ? data.files : null;
  } catch {
    return null;
  }
}
