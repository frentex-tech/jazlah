import { ErrorCode } from '@common/errors/error-code.enum';
import { PRODUCT_STATUSES } from './product-statuses.constants';
import type { ProductStatus } from './product-status.type';
import { ProductStatusMachine } from './product-status.state-machine';

const ALLOWED: readonly (readonly [ProductStatus, ProductStatus])[] = [
  ['draft', 'pending_review'],
  ['draft', 'published'],
  ['pending_review', 'published'],
  ['pending_review', 'rejected'],
  ['rejected', 'pending_review'],
];

const ALL_PAIRS = PRODUCT_STATUSES.flatMap((from) =>
  PRODUCT_STATUSES.map((to) => [from, to] as const),
);
const REFUSED = ALL_PAIRS.filter(
  ([from, to]) => !ALLOWED.some(([f, t]) => f === from && t === to),
);

const errorOf = (work: () => void): unknown => {
  try {
    work();
    return null;
  } catch (error) {
    return error;
  }
};

describe('ProductStatusMachine', () => {
  it.each(ALLOWED)('allows %s → %s', (from, to) => {
    expect(ProductStatusMachine.canMove(from, to)).toBe(true);
    expect(() => ProductStatusMachine.assertCanMove(from, to)).not.toThrow();
  });

  it.each(REFUSED)('refuses %s → %s with PRODUCT_NOT_EDITABLE', (from, to) => {
    expect(ProductStatusMachine.canMove(from, to)).toBe(false);
    expect(
      errorOf(() => ProductStatusMachine.assertCanMove(from, to)),
    ).toMatchObject({
      code: ErrorCode.PRODUCT_NOT_EDITABLE,
      details: { status: from },
    });
  });

  it('covers every pair of statuses', () => {
    expect(ALLOWED.length + REFUSED.length).toBe(16);
  });

  it('refuses edits only while under review', () => {
    expect(
      errorOf(() => ProductStatusMachine.assertEditable('pending_review')),
    ).toMatchObject({ code: ErrorCode.PRODUCT_NOT_EDITABLE });
    for (const status of ['draft', 'published', 'rejected'] as const) {
      expect(() => ProductStatusMachine.assertEditable(status)).not.toThrow();
    }
  });

  it('sends content edits of a published product through a change request', () => {
    expect(ProductStatusMachine.needsChangeRequest('published')).toBe(true);
    expect(ProductStatusMachine.needsChangeRequest('draft')).toBe(false);
    expect(ProductStatusMachine.needsChangeRequest('rejected')).toBe(false);
  });
});
