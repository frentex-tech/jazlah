import type { UploadPurpose } from '@modules/media';

/** A placeholder file the seed stores and records as a ready upload (ensureSeedFile). */
export type SeedFile = Readonly<{
  /** The media row's id (seedId). */
  id: string;
  purpose: UploadPurpose;
  contentType: string;
  bytes: Buffer;
  /** The user it belongs to, as if they had uploaded it; null for none. */
  ownerId: string | null;
  fileName: string;
}>;
