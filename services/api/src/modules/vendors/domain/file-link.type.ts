/** Where a file is read: a stable public URL (no expiry), or a presigned one that expires. */
export type FileLink = Readonly<{ url: string; expiresAt: Date | null }>;
