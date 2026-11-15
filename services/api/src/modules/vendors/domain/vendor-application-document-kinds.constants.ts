/**
 * The documents an application carries (FR-VND-01): the commercial registration, the
 * health certificate and photos of the facility. Every application has at least one of
 * each kind (VendorApplication.assertDocuments).
 */
export const VENDOR_APPLICATION_DOCUMENT_KINDS = [
  'commercial_registration',
  'health_certificate',
  'facility_photo',
] as const;
