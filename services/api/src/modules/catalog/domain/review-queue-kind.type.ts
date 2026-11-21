import type { REVIEW_QUEUE_KINDS } from './review-queue-kinds.constants';

/** One of `REVIEW_QUEUE_KINDS`. */
export type ReviewQueueKind = (typeof REVIEW_QUEUE_KINDS)[number];
