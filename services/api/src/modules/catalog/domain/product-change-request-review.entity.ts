import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { ProductChangeRequestStatus } from './product-change-request-status.type';

/** The rules on deciding a change request. */
export class ProductChangeRequestReview {
  /**
   * Only a pending request is decided. A superseded one (the vendor edited the product
   * again, which opened a newer request) is PRODUCT_CHANGE_REQUEST_SUPERSEDED, so the
   * dashboard reloads; an approved or rejected one is NOT_FOUND, as before.
   */
  static assertDecidable(status: ProductChangeRequestStatus): void {
    if (status === 'superseded') {
      throw new AppError(ErrorCode.PRODUCT_CHANGE_REQUEST_SUPERSEDED);
    }
    if (status !== 'pending') {
      throw new AppError(ErrorCode.NOT_FOUND);
    }
  }
}
