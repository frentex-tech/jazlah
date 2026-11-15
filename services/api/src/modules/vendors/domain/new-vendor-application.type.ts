import type { SealedIban } from './sealed-iban.type';
import type { VendorApplicationDocument } from './vendor-application-document.type';
import type { VendorBusinessDetails } from './vendor-business-details.type';

/** What a new application stores: pending, with its documents. */
export type NewVendorApplication = Readonly<{
  applicantId: string;
  details: VendorBusinessDetails;
  iban: SealedIban;
  documents: readonly VendorApplicationDocument[];
}>;
