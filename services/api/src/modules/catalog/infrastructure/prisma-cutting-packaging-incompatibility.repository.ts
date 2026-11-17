import { Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { toPage } from '@common/pagination/to-page';
import { DbContext } from '@infra/database/db-context';
import { keysetAfter } from '@infra/database/keyset-after';
import { KEYSET_ORDER } from '@infra/database/keyset-order.constants';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { CuttingPackagingIncompatibility } from '../domain/cutting-packaging-incompatibility.type';
import type { CuttingPackagingIncompatibilityRepository } from '../domain/ports/cutting-packaging-incompatibility.repository.port';
import type { ProductPackaging } from '../domain/product-packaging.type';

/**
 * The rules in `cutting_packaging_incompatibilities`. The same pair twice violates
 * `cutting_packaging_incompatibilities_pair_key`, mapped to CONFLICT.
 */
@Injectable()
export class PrismaCuttingPackagingIncompatibilityRepository implements CuttingPackagingIncompatibilityRepository {
  constructor(private readonly db: DbContext) {}

  async create(
    cuttingStyleId: string,
    packaging: ProductPackaging,
  ): Promise<CuttingPackagingIncompatibility> {
    try {
      return await this.db.client.cuttingPackagingIncompatibility.create({
        data: { cuttingStyleId, packaging },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async list(
    page: PageRequest,
  ): Promise<Page<CuttingPackagingIncompatibility>> {
    try {
      const rows =
        await this.db.client.cuttingPackagingIncompatibility.findMany({
          where: keysetAfter(page.cursor),
          orderBy: [...KEYSET_ORDER],
          take: page.limit + 1,
        });
      return toPage(rows, page.limit);
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async listAll(): Promise<CuttingPackagingIncompatibility[]> {
    try {
      return await this.db.client.cuttingPackagingIncompatibility.findMany({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { count } =
        await this.db.client.cuttingPackagingIncompatibility.deleteMany({
          where: { id },
        });
      return count === 1;
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async findForCuttingStyles(
    cuttingStyleIds: readonly string[],
  ): Promise<CuttingPackagingIncompatibility[]> {
    if (cuttingStyleIds.length === 0) {
      return [];
    }
    try {
      return await this.db.client.cuttingPackagingIncompatibility.findMany({
        where: { cuttingStyleId: { in: [...cuttingStyleIds] } },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
