import type { LocalizedText } from '@common/i18n/localized-text.type';
import type { ReviewQueueItem } from '../domain/review-queue-item.type';
import type { ReviewQueueItemResponseDto } from './dto/review-queue-item-response.dto';

/** A review queue item as a response, with its vendor's name (null if unreadable). */
export function toReviewQueueItemResponse(
  item: ReviewQueueItem,
  vendorNames: ReadonlyMap<string, LocalizedText>,
): ReviewQueueItemResponseDto {
  return {
    kind: item.kind,
    productId: item.productId,
    changeRequestId: item.changeRequestId,
    vendor: { id: item.vendorId, name: vendorNames.get(item.vendorId) ?? null },
    name: item.name,
    submittedAt: item.submittedAt,
  };
}
