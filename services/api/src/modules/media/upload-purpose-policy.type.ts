import type { DetectableContentType } from '@common/files/detectable-content-type.type';
import type { StorageVisibility } from '@integrations/storage';

/** What one upload purpose accepts, and where its files go. */
export type UploadPurposePolicy = Readonly<{
  /** public: product and catalog images (stable URL, later a CDN); private: everything else. */
  visibility: StorageVisibility;
  /** The types accepted, checked twice: declared (the upload policy) and real (first bytes). */
  contentTypes: readonly DetectableContentType[];
  maxSizeBytes: number;
}>;
