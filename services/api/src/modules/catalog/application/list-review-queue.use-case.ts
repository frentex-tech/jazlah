import { Inject, Injectable } from '@nestjs/common';
import type { PageRequest } from '@common/pagination/page-request.type';
import {
  CATALOG_VENDORS,
  type CatalogVendors,
} from '../domain/ports/catalog-vendors.port';
import {
  REVIEW_QUEUE_REPOSITORY,
  type ReviewQueueRepository,
} from '../domain/ports/review-queue.repository.port';
import type { ReviewQueueFilter } from '../domain/review-queue-filter.type';
import type { ReviewQueuePage } from './review-queue-page.type';

/**
 * The admins' one review queue: new products and edits of published ones together,
 * newest submission first, with how many wait (for the filter) and each vendor's name.
 */
@Injectable()
export class ListReviewQueueUseCase {
  constructor(
    @Inject(REVIEW_QUEUE_REPOSITORY)
    private readonly queue: ReviewQueueRepository,
    @Inject(CATALOG_VENDORS) private readonly vendors: CatalogVendors,
  ) {}

  async execute(
    filter: ReviewQueueFilter,
    request: PageRequest,
  ): Promise<ReviewQueuePage> {
    const [page, count] = await Promise.all([
      this.queue.list(filter, request),
      this.queue.count(filter),
    ]);
    const vendorNames = await this.vendors.namesOf([
      ...new Set(page.items.map((item) => item.vendorId)),
    ]);
    return { page, count, vendorNames };
  }
}
