import { Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { toPage } from '@common/pagination/to-page';
import { DbContext } from '@infra/database/db-context';
import { keysetAfter } from '@infra/database/keyset-after';
import { KEYSET_ORDER } from '@infra/database/keyset-order.constants';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { ChangeRequestDecision } from '../domain/change-request-decision.type';
import type { ProductChangeRequestRepository } from '../domain/ports/product-change-request.repository.port';
import type { ProductChangeRequest } from '../domain/product-change-request.type';
import type { ProductContent } from '../domain/product-content.type';
import { toProductChangeRequest } from './product-change-request.mapper';
import { toStoredProductContent } from './product-content.mapper';

/** Change requests in `product_change_requests`. */
@Injectable()
export class PrismaProductChangeRequestRepository implements ProductChangeRequestRepository {
  constructor(private readonly db: DbContext) {}

  /**
   * Two statements in the caller's transaction, under the product's row lock: the
   * pending request (at most one: the partial unique index
   * `product_change_requests_product_id_pending_key`) becomes `superseded`, then the new
   * one is inserted. Content is never updated in place.
   */
  async openPending(
    productId: string,
    requestedById: string,
    content: ProductContent,
  ): Promise<ProductChangeRequest> {
    const client = this.db.client;
    try {
      await client.productChangeRequest.updateMany({
        where: { productId, status: 'pending' },
        data: { status: 'superseded' },
      });
      return toProductChangeRequest(
        await client.productChangeRequest.create({
          data: {
            productId,
            requestedById,
            content: toStoredProductContent(content),
          },
        }),
      );
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findLatestOf(productId: string): Promise<ProductChangeRequest | null> {
    const pending = await this.findPendingOf(productId);
    if (pending !== null) {
      return pending;
    }
    try {
      const row = await this.db.client.productChangeRequest.findFirst({
        where: { productId },
        orderBy: [...KEYSET_ORDER],
      });
      return row === null ? null : toProductChangeRequest(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findPendingOf(productId: string): Promise<ProductChangeRequest | null> {
    try {
      const row = await this.db.client.productChangeRequest.findFirst({
        where: { productId, status: 'pending' },
      });
      return row === null ? null : toProductChangeRequest(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findById(id: string): Promise<ProductChangeRequest | null> {
    try {
      const row = await this.db.client.productChangeRequest.findUnique({
        where: { id },
      });
      return row === null ? null : toProductChangeRequest(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async listPending(page: PageRequest): Promise<Page<ProductChangeRequest>> {
    try {
      const rows = await this.db.client.productChangeRequest.findMany({
        where: { status: 'pending', ...keysetAfter(page.cursor) },
        orderBy: [...KEYSET_ORDER],
        take: page.limit + 1,
      });
      return toPage(rows.map(toProductChangeRequest), page.limit);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async decide(id: string, decision: ChangeRequestDecision): Promise<boolean> {
    try {
      const { count } = await this.db.client.productChangeRequest.updateMany({
        where: { id, status: 'pending' },
        data: {
          status: decision.status,
          reviewedById: decision.reviewerId,
          reviewedAt: new Date(),
          rejectionReason: decision.rejectionReason,
        },
      });
      return count === 1;
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
