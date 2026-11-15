import type { UploadPurpose } from './upload-purpose.type';

/**
 * The upload purposes each audience's upload endpoint accepts: a customer uploads the
 * documents of a vendor application, a vendor its logo, an admin the platform vendor's
 * logo. A purpose not listed for an audience is refused as invalid input. A module that
 * adds a purpose adds it here for the audiences that upload it.
 */
export const AUDIENCE_UPLOAD_PURPOSES = {
  customer: ['vendor.document'],
  vendor: ['vendor.logo'],
  admin: ['vendor.logo'],
} as const satisfies Readonly<
  Record<'customer' | 'vendor' | 'admin', readonly UploadPurpose[]>
>;
