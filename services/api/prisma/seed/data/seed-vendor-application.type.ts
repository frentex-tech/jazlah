import type { SeedDocumentKind } from './seed-document-kind.type';

/**
 * A vendor application the seed creates, with its documents (placeholder files in the
 * private bucket, owned by the applicant). An approved or rejected one was reviewed by
 * the admin development account; a rejected one carries the admin's reason.
 */
export type SeedVendorApplication = Readonly<{
  key: string;
  /** The applicant: a SeedUser key. */
  applicant: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  /** 10 digits. */
  commercialRegistrationNumber: string;
  accountHolderName: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'approved' | 'rejected';
  /** Set exactly when the status is rejected. */
  rejectionReason: string | null;
  documents: readonly SeedDocumentKind[];
}>;
