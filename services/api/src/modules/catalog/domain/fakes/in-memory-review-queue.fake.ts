import { keysetPage } from '@common/pagination/keyset-page.fake';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { ReviewQueueRepository } from '../ports/review-queue.repository.port';
import type { ReviewQueueFilter } from '../review-queue-filter.type';
import type { ReviewQueueItem } from '../review-queue-item.type';
import type { InMemoryProductChangeRequests } from './in-memory-product-change-requests.fake';
import type { InMemoryProductRepository } from './in-memory-product.repository.fake';

/** The review queue read from the products and change requests fakes, as the SQL does. */
export class InMemoryReviewQueue implements ReviewQueueRepository {
  constructor(
    private readonly products: InMemoryProductRepository,
    private readonly changeRequests: InMemoryProductChangeRequests,
  ) {}

  list(
    filter: ReviewQueueFilter,
    page: PageRequest,
  ): Promise<Page<ReviewQueueItem>> {
    const items = new Map(this.items(filter).map((item) => [item.id, item]));
    const sorted = keysetPage(
      [...items.values()].map((item) => ({
        id: item.id,
        createdAt: item.submittedAt,
      })),
      page,
    );
    return Promise.resolve({
      items: sorted.items.flatMap((key) => {
        const item = items.get(key.id);
        return item === undefined ? [] : [item];
      }),
      nextCursor: sorted.nextCursor,
    });
  }

  count(filter: ReviewQueueFilter): Promise<number> {
    return Promise.resolve(this.items(filter).length);
  }

  private items(filter: ReviewQueueFilter): ReviewQueueItem[] {
    const live = new Map(this.products.rows.map((row) => [row.id, row]));
    const products: ReviewQueueItem[] = this.products.rows.flatMap((row) =>
      row.status === 'pending_review' && row.submittedAt !== null
        ? [
            {
              kind: 'product' as const,
              id: row.id,
              productId: row.id,
              changeRequestId: null,
              vendorId: row.vendorId,
              name: row.content.name,
              submittedAt: row.submittedAt,
            },
          ]
        : [],
    );
    const requests: ReviewQueueItem[] = this.changeRequests.rows.flatMap(
      (request) => {
        const product = live.get(request.productId);
        return request.status === 'pending' && product !== undefined
          ? [
              {
                kind: 'change_request' as const,
                id: request.id,
                productId: request.productId,
                changeRequestId: request.id,
                vendorId: product.vendorId,
                name: product.content.name,
                submittedAt: request.createdAt,
              },
            ]
          : [];
      },
    );
    return [...products, ...requests].filter(
      (item) =>
        (filter.kind === undefined || item.kind === filter.kind) &&
        (filter.vendorId === undefined || item.vendorId === filter.vendorId),
    );
  }
}
