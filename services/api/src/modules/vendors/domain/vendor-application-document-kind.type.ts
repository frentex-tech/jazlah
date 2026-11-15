import type { VENDOR_APPLICATION_DOCUMENT_KINDS } from './vendor-application-document-kinds.constants';

/** What a document attached to an application shows. */
export type VendorApplicationDocumentKind =
  (typeof VENDOR_APPLICATION_DOCUMENT_KINDS)[number];
