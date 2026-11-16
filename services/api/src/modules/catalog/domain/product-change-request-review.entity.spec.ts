import { ErrorCode } from '@common/errors/error-code.enum';
import { ProductChangeRequestReview } from './product-change-request-review.entity';

const errorOf = (work: () => void): unknown => {
  try {
    work();
    return null;
  } catch (error) {
    return error;
  }
};

describe('ProductChangeRequestReview.assertDecidable', () => {
  it('lets a pending request be decided', () => {
    expect(
      errorOf(() => ProductChangeRequestReview.assertDecidable('pending')),
    ).toBeNull();
  });

  it('refuses a superseded request with its own code', () => {
    expect(
      errorOf(() => ProductChangeRequestReview.assertDecidable('superseded')),
    ).toMatchObject({ code: ErrorCode.PRODUCT_CHANGE_REQUEST_SUPERSEDED });
  });

  it.each(['approved', 'rejected'] as const)(
    'answers a %s request as NOT_FOUND',
    (status) => {
      expect(
        errorOf(() => ProductChangeRequestReview.assertDecidable(status)),
      ).toMatchObject({ code: ErrorCode.NOT_FOUND });
    },
  );
});
