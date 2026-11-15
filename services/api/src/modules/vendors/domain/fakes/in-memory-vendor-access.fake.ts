import type { VendorAccess } from '../ports/vendor-access.port';

/** VendorAccess in memory: records each grant, or fails the next one on request. */
export class InMemoryVendorAccess implements VendorAccess {
  grants: readonly Readonly<{ userId: string; vendorId: string }>[] = [];
  private failure: Error | null = null;

  /** Makes the next grant throw `error`, as a database failure would. */
  failNextWith(error: Error): void {
    this.failure = error;
  }

  grant(userId: string, vendorId: string): Promise<void> {
    const failure = this.failure;
    if (failure !== null) {
      this.failure = null;
      return Promise.reject(failure);
    }
    this.grants = [...this.grants, { userId, vendorId }];
    return Promise.resolve();
  }
}
