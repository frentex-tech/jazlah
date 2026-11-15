import { Inject, Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import {
  PRODUCT_CHANGE_REQUEST_REPOSITORY,
  type ProductChangeRequestRepository,
} from '../domain/ports/product-change-request.repository.port';
import type { ProductChangeRequest } from '../domain/product-change-request.type';

/** The pending change requests, newest first: the admins' second review queue. */
@Injectable()
export class ListProductChangeRequestsUseCase {
  constructor(
    @Inject(PRODUCT_CHANGE_REQUEST_REPOSITORY)
    private readonly changeRequests: ProductChangeRequestRepository,
  ) {}

  execute(page: PageRequest): Promise<Page<ProductChangeRequest>> {
    return this.changeRequests.listPending(page);
  }
}
