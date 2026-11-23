/** Where a ready file is read: a stable public URL (no expiry) or a presigned GET. */
export type DownloadLink = Readonly<{ url: string; expiresAt: Date | null }>;
