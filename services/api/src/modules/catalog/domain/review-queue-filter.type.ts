import type { ReviewQueueKind } from './review-queue-kind.type';

/** Which waiting items to read: every kind and vendor when left out. */
export type ReviewQueueFilter = Readonly<{
  kind?: ReviewQueueKind;
  vendorId?: string;
}>;
