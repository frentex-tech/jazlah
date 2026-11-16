import { Inject, Injectable } from '@nestjs/common';
import type { PageRequest } from '@common/pagination/page-request.type';
import {
  CATALOG_MEDIA,
  type CatalogMedia,
} from '../domain/ports/catalog-media.port';
import {
  PRODUCT_CHANGE_REQUEST_REPOSITORY,
  type ProductChangeRequestRepository,
} from '../domain/ports/product-change-request.repository.port';
import type { ProductChangeRequestPage } from './product-change-request-page.type';

/**
 * The pending change requests, newest first: the admins' second review queue, with the
 * URLs of the images each proposes (one read for the page).
 */
@Injectable()
export class ListProductChangeRequestsUseCase {
  constructor(
    @Inject(PRODUCT_CHANGE_REQUEST_REPOSITORY)
    private readonly changeRequests: ProductChangeRequestRepository,
    @Inject(CATALOG_MEDIA) private readonly media: CatalogMedia,
  ) {}

  async execute(request: PageRequest): Promise<ProductChangeRequestPage> {
    const page = await this.changeRequests.listPending(request);
    const ids = page.items.flatMap((item) => item.content.imageMediaIds);
    return { page, imageUrls: await this.media.publicUrls([...new Set(ids)]) };
  }
}
