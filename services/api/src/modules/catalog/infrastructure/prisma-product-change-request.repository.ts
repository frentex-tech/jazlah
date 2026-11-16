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
   * One statement: an insert, or, when the product already has a pending request
   * (the partial unique index `product_change_requests_product_id_pending_key`), an
   * update of its content. Two concurrent edits cannot create two pending requests.
   */
  async savePending(
    productId: string,
    requestedById: string,
    content: ProductContent,
  ): Promise<ProductChangeRequest> {
    const json = JSON.stringify(toStoredProductContent(content));
    try {
      await this.db.client.$executeRaw`
        INSERT INTO "product_change_requests"
          ("product_id", "requested_by_id", "status", "content", "updated_at")
        VALUES
          (${productId}::uuid, ${requestedById}::uuid, 'pending', ${json}::jsonb, now())
        ON CONFLICT ("product_id") WHERE "status" = 'pending'
        DO UPDATE SET
          "requested_by_id" = EXCLUDED."requested_by_id",
          "content" = EXCLUDED."content",
          "updated_at" = now()`;
      const row = await this.db.client.productChangeRequest.findFirst({
        where: { productId, status: 'pending' },
      });
      if (row === null) {
        throw new Error(
          'The pending change request was not found after saving it',
        );
      }
      return toProductChangeRequest(row);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findLatestOf(productId: string): Promise<ProductChangeRequest | null> {
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

  async findPending(id: string): Promise<ProductChangeRequest | null> {
    try {
      const row = await this.db.client.productChangeRequest.findFirst({
        where: { id, status: 'pending' },
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
