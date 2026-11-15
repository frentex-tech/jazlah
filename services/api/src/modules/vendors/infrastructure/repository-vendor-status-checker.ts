import { Inject, Injectable } from '@nestjs/common';
import type { VendorStatusChecker } from '@common/auth/vendor-status-checker.interface';
import {
  VENDOR_REPOSITORY,
  type VendorRepository,
} from '../domain/ports/vendor.repository.port';

/**
 * The VendorStatusChecker the organisation status guard and the auth module ask: one
 * read of the vendor's status per call, so a suspension applies at once. An unknown
 * vendor counts as suspended.
 */
@Injectable()
export class RepositoryVendorStatusChecker implements VendorStatusChecker {
  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly vendors: VendorRepository,
  ) {}

  isSuspended(vendorId: string): Promise<boolean> {
    return this.vendors.isSuspended(vendorId);
  }
}
