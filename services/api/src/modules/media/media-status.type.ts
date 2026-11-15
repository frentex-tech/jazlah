/**
 * pending: requested, not confirmed; ready: confirmed and checked; rejected: failed a
 * check or expired, its object deleted.
 */
export type MediaStatus = 'pending' | 'ready' | 'rejected';
