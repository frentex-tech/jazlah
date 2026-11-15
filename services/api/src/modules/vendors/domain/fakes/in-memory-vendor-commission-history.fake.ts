import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { NewVendorCommissionChange } from '../new-vendor-commission-change.type';
import type { VendorCommissionHistory } from '../ports/vendor-commission-history.port';
import type { VendorCommissionChange } from '../vendor-commission-change.type';
import { keysetPage } from './keyset-page.fake';

/** VendorCommissionHistory in memory: entries are only ever appended. */
export class InMemoryVendorCommissionHistory implements VendorCommissionHistory {
  rows: readonly VendorCommissionChange[] = [];
  private clock = Date.parse('2026-11-15T11:00:00.000Z');

  record(change: NewVendorCommissionChange): Promise<VendorCommissionChange> {
    this.clock += 1_000;
    const entry: VendorCommissionChange = {
      ...change,
      id: `00000000-0000-4000-a000-${String(this.rows.length + 1).padStart(12, '0')}`,
      createdAt: new Date(this.clock),
    };
    this.rows = [...this.rows, entry];
    return Promise.resolve(entry);
  }

  listOf(
    vendorId: string,
    page: PageRequest,
  ): Promise<Page<VendorCommissionChange>> {
    return Promise.resolve(
      keysetPage(
        this.rows.filter((entry) => entry.vendorId === vendorId),
        page,
      ),
    );
  }
}
