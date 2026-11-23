import type { VendorStatusChecker } from '@common/auth/vendor-status-checker.interface';

/** The vendors' statuses for the auth use case tests: every vendor active unless suspended here. */
export class InMemoryVendorStatusChecker implements VendorStatusChecker {
  private readonly suspended = new Set<string>();

  suspend(vendorId: string): void {
    this.suspended.add(vendorId);
  }

  reinstate(vendorId: string): void {
    this.suspended.delete(vendorId);
  }

  isSuspended(vendorId: string): Promise<boolean> {
    return Promise.resolve(this.suspended.has(vendorId));
  }
}
