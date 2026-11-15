import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { NewVendorCommissionChange } from '../new-vendor-commission-change.type';
import type { VendorCommissionChange } from '../vendor-commission-change.type';

/** Injection token of the VendorCommissionHistory. */
export const VENDOR_COMMISSION_HISTORY = Symbol('VENDOR_COMMISSION_HISTORY');

/** The insert-only history of vendors' commissions: entries are added, never changed. */
export interface VendorCommissionHistory {
  record(change: NewVendorCommissionChange): Promise<VendorCommissionChange>;

  /** The vendor's entries, newest first. */
  listOf(
    vendorId: string,
    page: PageRequest,
  ): Promise<Page<VendorCommissionChange>>;
}
