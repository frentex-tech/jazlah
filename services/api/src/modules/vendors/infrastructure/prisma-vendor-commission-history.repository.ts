import { Injectable } from '@nestjs/common';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import { toPage } from '@common/pagination/to-page';
import { DbContext } from '@infra/database/db-context';
import { keysetAfter } from '@infra/database/keyset-after';
import { KEYSET_ORDER } from '@infra/database/keyset-order.constants';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import type { NewVendorCommissionChange } from '../domain/new-vendor-commission-change.type';
import type { VendorCommissionHistory } from '../domain/ports/vendor-commission-history.port';
import type { VendorCommissionChange } from '../domain/vendor-commission-change.type';
import { toVendorCommissionChange } from './vendor-commission-change.mapper';

/**
 * The commission history in `vendor_commission_changes`: insert-only. This class has no
 * update or delete, and nothing else writes the table.
 */
@Injectable()
export class PrismaVendorCommissionHistory implements VendorCommissionHistory {
  constructor(private readonly db: DbContext) {}

  async record(
    change: NewVendorCommissionChange,
  ): Promise<VendorCommissionChange> {
    try {
      return toVendorCommissionChange(
        await this.db.client.vendorCommissionChange.create({ data: change }),
      );
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async listOf(
    vendorId: string,
    page: PageRequest,
  ): Promise<Page<VendorCommissionChange>> {
    try {
      const rows = await this.db.client.vendorCommissionChange.findMany({
        where: { vendorId, ...keysetAfter(page.cursor) },
        orderBy: [...KEYSET_ORDER],
        take: page.limit + 1,
      });
      return toPage(rows.map(toVendorCommissionChange), page.limit);
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
