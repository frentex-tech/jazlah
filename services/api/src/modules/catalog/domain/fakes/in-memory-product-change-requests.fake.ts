import { keysetPage } from '@common/pagination/keyset-page.fake';
import type { Page } from '@common/pagination/page.type';
import type { PageRequest } from '@common/pagination/page-request.type';
import type { ChangeRequestDecision } from '../change-request-decision.type';
import type { ProductChangeRequestRepository } from '../ports/product-change-request.repository.port';
import type { ProductChangeRequest } from '../product-change-request.type';
import type { ProductContent } from '../product-content.type';
import { fakeIds } from './fake-ids.fake';
import type { InMemoryProductLocks } from './in-memory-product-locks.fake';

/**
 * Change requests in memory; `rows` is replaced on every write (fake rollback). A write
 * needs its product's lock (InMemoryProductLocks).
 */
export class InMemoryProductChangeRequests implements ProductChangeRequestRepository {
  private readonly newId = fakeIds('8003');
  rows: readonly ProductChangeRequest[] = [];
  private clock = Date.UTC(2026, 10, 16, 10, 0, 0);

  constructor(private readonly locks: InMemoryProductLocks) {}

  savePending(
    productId: string,
    requestedById: string,
    content: ProductContent,
  ): Promise<ProductChangeRequest> {
    this.locks.assertLocked(productId);
    const now = this.nextDate();
    const pending = this.rows.find(
      (row) => row.productId === productId && row.status === 'pending',
    );
    const saved: ProductChangeRequest =
      pending === undefined
        ? {
            id: this.newId(),
            productId,
            requestedById,
            status: 'pending',
            content,
            rejectionReason: null,
            reviewedAt: null,
            createdAt: now,
            updatedAt: now,
          }
        : { ...pending, requestedById, content, updatedAt: now };
    this.rows = [...this.rows.filter((row) => row.id !== saved.id), saved];
    return Promise.resolve(saved);
  }

  findLatestOf(productId: string): Promise<ProductChangeRequest | null> {
    const latest = keysetPage(
      this.rows.filter((row) => row.productId === productId),
      { cursor: null, limit: 1 },
    ).items[0];
    return Promise.resolve(latest ?? null);
  }

  findPending(id: string): Promise<ProductChangeRequest | null> {
    return Promise.resolve(
      this.rows.find((row) => row.id === id && row.status === 'pending') ??
        null,
    );
  }

  listPending(page: PageRequest): Promise<Page<ProductChangeRequest>> {
    return Promise.resolve(
      keysetPage(
        this.rows.filter((row) => row.status === 'pending'),
        page,
      ),
    );
  }

  decide(id: string, decision: ChangeRequestDecision): Promise<boolean> {
    const pending = this.rows.find(
      (row) => row.id === id && row.status === 'pending',
    );
    if (pending === undefined) {
      return Promise.resolve(false);
    }
    this.locks.assertLocked(pending.productId);
    const now = this.nextDate();
    this.rows = this.rows.map((row) =>
      row.id === id
        ? {
            ...row,
            status: decision.status,
            rejectionReason: decision.rejectionReason,
            reviewedAt: now,
            updatedAt: now,
          }
        : row,
    );
    return Promise.resolve(true);
  }

  private nextDate(): Date {
    this.clock += 1_000;
    return new Date(this.clock);
  }
}
