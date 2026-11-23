import { maskIban } from '../domain/mask-iban';
import type { VendorApplication } from '../domain/vendor-application.entity';
import type { VendorApplicationResponseDto } from './dto/vendor-application-response.dto';

/** An application as a response; the IBAN only masked. */
export function toVendorApplicationResponse(
  application: VendorApplication,
): VendorApplicationResponseDto {
  const { details } = application;
  return {
    id: application.id,
    applicantId: application.applicantId,
    status: application.status,
    name: { ...details.name },
    description: { ...details.description },
    commercialRegistrationNumber: details.commercialRegistrationNumber,
    vatNumber: details.vatNumber,
    city: details.city,
    ibanMasked: maskIban(application.ibanLast4),
    accountHolderName: details.accountHolderName,
    location: { ...details.location },
    documents: application.documents.map((document) => ({ ...document })),
    rejectionReason: application.rejectionReason,
    reviewedAt: application.reviewedAt,
    createdAt: application.createdAt,
  };
}
