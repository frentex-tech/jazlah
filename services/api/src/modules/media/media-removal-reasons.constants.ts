import type { MediaRejectionReason } from './media-rejection-reason.type';

/**
 * The rejection reasons that mark a row for removal: the cleanup job deletes the objects
 * of such a row, then the row (MediaService.removeExpiredUploads). EXPIRED: never
 * confirmed in time; OWNER_DELETED: its owner deleted their account.
 */
export const MEDIA_REMOVAL_REASONS = [
  'EXPIRED',
  'OWNER_DELETED',
] as const satisfies readonly MediaRejectionReason[];
