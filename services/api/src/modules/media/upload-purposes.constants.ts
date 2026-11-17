import type { UploadPurposePolicy } from './upload-purpose-policy.type';

const MEGABYTE = 1024 * 1024;

/**
 * Every upload purpose: why a file is uploaded, which bucket it goes to, which types
 * and how large. A lookup table: a module that needs uploads adds its purpose here,
 * named `<module>.<what>` in kebab-case (the object key starts with it, dots as
 * slashes), and calls MediaService with it. A type that content-type detection does
 * not recognise yet needs its signature in `src/common/files/` first.
 *
 * Which audience may upload for which purpose: AUDIENCE_UPLOAD_PURPOSES.
 */
export const UPLOAD_PURPOSES = {
  'catalog.product-image': {
    visibility: 'public',
    contentTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * MEGABYTE,
  },
  'vendor.logo': {
    visibility: 'public',
    contentTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 2 * MEGABYTE,
  },
  'vendor.cover': {
    visibility: 'public',
    contentTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 2 * MEGABYTE,
  },
  'vendor.document': {
    visibility: 'private',
    contentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 10 * MEGABYTE,
  },
} as const satisfies Readonly<Record<string, UploadPurposePolicy>>;
