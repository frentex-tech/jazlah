import type { VendorApplicationDocument } from '../domain/vendor-application-document.type';
import type { VendorBusinessDetails } from '../domain/vendor-business-details.type';

/** What SubmitVendorApplicationUseCase needs. */
export type SubmitVendorApplicationInput = Readonly<{
  /** The signed-in customer: from the access token, never from the request body. */
  applicantId: string;
  details: VendorBusinessDetails;
  /** In electronic form (capital letters, Latin digits, no spaces). */
  iban: string;
  documents: readonly VendorApplicationDocument[];
}>;
