import type { SeedDocumentKind } from './data/seed-document-kind.type';
import type { SeedVendorApplication } from './data/seed-vendor-application.type';
import { encodePlaceholderPdf } from './encode-placeholder-pdf';
import { encodeSolidPng } from './encode-solid-png';
import type { SeedFile } from './seed-file.type';
import { seedId } from './seed-id';

/** The title printed on each placeholder document, by kind. */
const DOCUMENT_TITLES: Readonly<Record<SeedDocumentKind, string>> = {
  commercial_registration: 'Commercial registration',
  health_certificate: 'Health certificate',
  facility_photo: 'Facility photo',
};

/**
 * The placeholder file of one document of an application, owned by its applicant (a
 * `vendor.document` upload, private bucket): a one-page PDF naming the document and the
 * applicant's business for the registration and the certificate, a solid PNG for the
 * facility photo. Clearly marked as development data.
 */
export function applicationDocumentFile(
  application: SeedVendorApplication,
  kind: SeedDocumentKind,
  applicantId: string,
): SeedFile {
  const id = seedId(`media:application:${application.key}:${kind}`);
  if (kind === 'facility_photo') {
    return {
      id,
      purpose: 'vendor.document',
      contentType: 'image/png',
      bytes: encodeSolidPng(640, 480, '#6B7B8C'),
      ownerId: applicantId,
      fileName: `${application.key}-${kind}.png`,
    };
  }
  return {
    id,
    purpose: 'vendor.document',
    contentType: 'application/pdf',
    bytes: encodePlaceholderPdf([
      DOCUMENT_TITLES[kind],
      application.nameEn,
      `Number ${application.commercialRegistrationNumber}`,
      'JAZLA development seed: a placeholder, not a real document.',
    ]),
    ownerId: applicantId,
    fileName: `${application.key}-${kind}.pdf`,
  };
}
