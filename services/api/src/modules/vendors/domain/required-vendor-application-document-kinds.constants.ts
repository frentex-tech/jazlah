import type { VendorApplicationDocumentKind } from './vendor-application-document-kind.type';

/**
 * The kinds every application carries at least one of (VendorApplication.assertDocuments).
 * The other kinds (municipality_licence, national_id) are accepted but optional.
 */
export const REQUIRED_VENDOR_APPLICATION_DOCUMENT_KINDS: readonly VendorApplicationDocumentKind[] =
  ['commercial_registration', 'health_certificate', 'facility_photo'];
