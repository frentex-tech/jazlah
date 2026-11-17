/**
 * The documents an application may carry (FR-VND-01): the commercial registration, the
 * health certificate, photos of the facility, the municipality licence and the owner's
 * national id. Only REQUIRED_VENDOR_APPLICATION_DOCUMENT_KINDS must be present; the others
 * are optional.
 */
export const VENDOR_APPLICATION_DOCUMENT_KINDS = [
  'commercial_registration',
  'health_certificate',
  'facility_photo',
  'municipality_licence',
  'national_id',
] as const;
