import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { ReviewQueueFilter } from '../review-queue-filter.type';
import type { ReviewQueueItem } from '../review-queue-item.type';

/** Injection token of the ReviewQueueRepository. */
export const REVIEW_QUEUE_REPOSITORY = Symbol('REVIEW_QUEUE_REPOSITORY');

/**
 * The admins' one review queue: products `pending_review` and `pending` change requests
 * together. A page's cursor holds the submission time (its `createdAt`) and the item id.
 */
export interface ReviewQueueRepository {
  /** Newest submission first, then id. */
  list(
    filter: ReviewQueueFilter,
    page: PageRequest,
  ): Promise<Page<ReviewQueueItem>>;

  /** How many items wait, for the filter. */
  count(filter: ReviewQueueFilter): Promise<number>;
}
