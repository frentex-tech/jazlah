import type { VendorApplicationDocumentKind } from './vendor-application-document-kind.type';

/** A file attached to an application: a `vendor.document` upload of the applicant. */
export type VendorApplicationDocument = Readonly<{
  kind: VendorApplicationDocumentKind;
  mediaId: string;
}>;
