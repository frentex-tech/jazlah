/**
 * The product row locks of the in-memory fakes. The fake transaction opens and closes
 * them; `lock` outside a transaction throws, and so does a write to a product or its
 * children unless that product was locked in the open transaction before it was first
 * read there (a decision from a read taken before the lock is the stale read the lock
 * prevents). So every use case test also proves the rule: lock the product row, then
 * read and decide (ProductRepository.lockForWrite).
 */
export class InMemoryProductLocks {
  private held: Set<string> | null = null;
  private readUnlocked = new Set<string>();

  begin(): void {
    this.held = new Set();
    this.readUnlocked = new Set();
  }

  end(): void {
    this.held = null;
    this.readUnlocked = new Set();
  }

  /** Records a read of the product; inside a transaction, before its lock, it taints it. */
  noteRead(productId: string): void {
    if (this.held !== null && !this.held.has(productId)) {
      this.readUnlocked.add(productId);
    }
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
    if (this.readUnlocked.has(productId)) {
      throw new Error(
        `Write to product ${productId} decided from a read taken before its row lock`,
      );
    }
  }
}
