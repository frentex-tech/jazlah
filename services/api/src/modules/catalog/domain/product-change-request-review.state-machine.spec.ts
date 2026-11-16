import { ErrorCode } from '@common/errors/error-code.enum';
import { ProductChangeRequestReviewMachine } from './product-change-request-review.state-machine';
import type { ProductChangeRequestStatus } from './product-change-request-status.type';

const errorOf = (work: () => void): unknown => {
  try {
    work();
    return null;
  } catch (error) {
    return error;
  }
};

describe('ProductChangeRequestReviewMachine.assertCanMove', () => {
  it.each(['approved', 'rejected', 'superseded'] as const)(
    'lets a pending request become %s',
    (to) => {
      expect(
        errorOf(() =>
          ProductChangeRequestReviewMachine.assertCanMove('pending', to),
        ),
      ).toBeNull();
    },
  );

  it.each(['approved', 'rejected', 'superseded'] as const)(
    'refuses to move a superseded request to %s with its own code',
    (to) => {
      expect(
        errorOf(() =>
          ProductChangeRequestReviewMachine.assertCanMove('superseded', to),
        ),
      ).toMatchObject({ code: ErrorCode.PRODUCT_CHANGE_REQUEST_SUPERSEDED });
    },
  );

  it.each([
    ['approved', 'rejected'],
    ['approved', 'superseded'],
    ['rejected', 'approved'],
    ['rejected', 'superseded'],
    ['pending', 'pending'],
  ] as const satisfies readonly (readonly [
    ProductChangeRequestStatus,
    ProductChangeRequestStatus,
  ])[])('answers %s to %s as NOT_FOUND', (from, to) => {
    expect(
      errorOf(() => ProductChangeRequestReviewMachine.assertCanMove(from, to)),
    ).toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
