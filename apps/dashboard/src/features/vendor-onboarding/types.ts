import type { Schemas } from '@/api/client';

// The API's own shapes (services/api/openapi.json → src/api/schema.d.ts); docs/frontend/vendors.md, uploads.md.
export type VendorApplication = Schemas['VendorApplicationResponseDto'];
export type SubmitApplication = Schemas['SubmitVendorApplicationDto'];
export type DocKind = Schemas['VendorApplicationDocumentDto']['kind'];
export type VendorProfile = Schemas['VendorProfileResponseDto'];
export type UpdateProfile = Schemas['UpdateVendorProfileDto'];
export type UploadTicket = Schemas['UploadTicketResponseDto'];
export type MediaFile = Schemas['MediaFileResponseDto'];
export type VendorUploadPurpose = Schemas['RequestVendorUploadDto']['purpose'];

/** Document kinds in the order of the documents step (410:39867); the first three are required by the API. */
export const DOC_KINDS = ['commercial_registration', 'health_certificate', 'facility_photo', 'municipality_licence', 'national_id'] as const satisfies readonly DocKind[];
export const REQUIRED_DOCS: readonly DocKind[] = DOC_KINDS.slice(0, 3);

/** Upload limits per purpose, from the upload endpoints' descriptions. */
export const DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const DOC_MAX_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
