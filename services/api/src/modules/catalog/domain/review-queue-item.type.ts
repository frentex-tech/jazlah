import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { ReviewQueueKind } from './review-queue-kind.type';

/** One item waiting for an admin: a product under review or a pending change request. */
export type ReviewQueueItem = Readonly<{
  kind: ReviewQueueKind;
  /** The item's own id: the product's for `product`, the request's for `change_request`. */
  id: string;
  productId: string;
  /** The pending request's id; null for `product`. */
  changeRequestId: string | null;
  vendorId: string;
  /** The live product's name (a change request may propose another). */
  name: LocalizedText;
  /** When it entered the queue: the submission, or the edit that opened the request. */
  submittedAt: Date;
}>;
