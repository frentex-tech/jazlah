import type { MediaRejectionReason } from './media-rejection-reason.type';

/**
 * The rejection reasons of a file that failed the checks at confirmation: its objects are
 * already deleted, the row is kept so the client learns why.
 */
export const MEDIA_CHECK_FAILURE_REASONS = [
  'OBJECT_MISSING',
  'EMPTY_FILE',
  'TOO_LARGE',
  'TYPE_NOT_ALLOWED',
  'CONTENT_TYPE_MISMATCH',
] as const satisfies readonly MediaRejectionReason[];
