import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { Page } from '@common/pagination/page.type';
import type { ReviewQueueItem } from '../domain/review-queue-item.type';

/** A page of the review queue, how many wait in all, and the vendors' names. */
export type ReviewQueuePage = Readonly<{
  page: Page<ReviewQueueItem>;
  count: number;
  vendorNames: ReadonlyMap<string, LocalizedText>;
}>;
