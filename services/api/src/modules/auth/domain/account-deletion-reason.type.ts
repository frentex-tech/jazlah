import type { ACCOUNT_DELETION_REASONS } from './account-deletion-reasons.constants';

/** One of ACCOUNT_DELETION_REASONS. */
export type AccountDeletionReason = (typeof ACCOUNT_DELETION_REASONS)[number];
