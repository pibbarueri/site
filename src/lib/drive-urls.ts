// Plain URL builders for Drive files. No environment access, so the browser bundle can use them.

// `size` is the lh3 sizing suffix: "w1600" (fit the width) or "w448-h336-c" (crop to fill).
export function driveImageUrl(id: string, size: string): string {
  return `https://lh3.googleusercontent.com/d/${id}=${size}`;
}

// Opens the file in the Drive viewer.
export function driveFileUrl(id: string): string {
  return `https://drive.google.com/file/d/${id}/view`;
}
