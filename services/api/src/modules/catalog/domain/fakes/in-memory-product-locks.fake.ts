/**
 * The product row locks of the in-memory fakes. The fake transaction opens and closes
 * them; `lock` outside a transaction, or a write to a product or its children without
 * that product's lock taken in the open transaction, throws. So every use case test
 * also proves the rule that a write locks the product row first
 * (ProductRepository.lockForWrite).
 */
export class InMemoryProductLocks {
  private held: Set<string> | null = null;

  begin(): void {
    this.held = new Set();
  }

  end(): void {
    this.held = null;
  }

  lock(productId: string): void {
    if (this.held === null) {
      throw new Error(
        `Product ${productId} locked outside a transaction: the lock would end at once`,
      );
    }
    this.held.add(productId);
  }

  assertLocked(productId: string): void {
    if (this.held?.has(productId) !== true) {
      throw new Error(
        `Write to product ${productId} without its row lock (lockForWrite first, in the transaction)`,
      );
    }
  }
}
