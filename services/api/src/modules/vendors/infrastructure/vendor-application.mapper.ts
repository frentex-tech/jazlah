import type {
  VendorApplication as VendorApplicationRow,
  VendorApplicationDocument as VendorApplicationDocumentRow,
} from '@infra/database/generated/prisma/client';
import { VendorApplication } from '../domain/vendor-application.entity';

/**
 * A row of `vendor_applications` with its documents as the domain's entity; the
 * encrypted IBAN stays behind.
 */
export function toVendorApplication(
  row: VendorApplicationRow & { documents: VendorApplicationDocumentRow[] },
): VendorApplication {
  return new VendorApplication(
    row.id,
    row.applicantId,
    {
      name: { ar: row.nameAr, en: row.nameEn },
      description: { ar: row.descriptionAr, en: row.descriptionEn },
      commercialRegistrationNumber: row.commercialRegistrationNumber,
      accountHolderName: row.accountHolderName,
      location: { latitude: row.latitude, longitude: row.longitude },
    },
    row.ibanLast4,
    row.status,
    row.rejectionReason,
    row.reviewedById,
    row.reviewedAt,
    [...row.documents]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((document) => ({ kind: document.kind, mediaId: document.mediaId })),
    row.createdAt,
  );
}
