import type { StorageVisibility } from '@integrations/storage';
import type { MediaRejectionReason } from './media-rejection-reason.type';
import type { MediaStatus } from './media-status.type';

/** One uploaded file, as the media module reports it. */
export type MediaFile = Readonly<{
  id: string;
  /** An UploadPurpose; typed as a string because rows outlive purposes. */
  purpose: string;
  visibility: StorageVisibility;
  status: MediaStatus;
  /** Null until the file is ready. */
  sizeBytes: number | null;
  /** The type read from the file's first bytes; null until the file is ready. */
  contentType: string | null;
  originalFileName: string | null;
  ownerId: string | null;
  rejectionReason: MediaRejectionReason | null;
  createdAt: Date;
  confirmedAt: Date | null;
}>;
