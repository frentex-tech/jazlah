import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { ProductChangeRequestStatus } from './product-change-request-status.type';

/**
 * The life of a change request, the only place its status changes are decided: pending
 * becomes approved or rejected (an admin's decision) or superseded (the vendor edited
 * the product again, which opens a newer request), once; the other statuses never
 * change. The content never changes at all. The repository makes each change with a
 * conditional update from pending, under the product's row lock.
 */
export class ProductChangeRequestReviewMachine {
  private static readonly next: Readonly<
    Record<ProductChangeRequestStatus, readonly ProductChangeRequestStatus[]>
  > = {
    pending: ['approved', 'rejected', 'superseded'],
    approved: [],
    rejected: [],
    superseded: [],
  };

  /**
   * Throws unless `from` may become `to`: PRODUCT_CHANGE_REQUEST_SUPERSEDED from a
   * superseded request (the dashboard reloads and shows the newer one), NOT_FOUND from
   * an approved or rejected one.
   */
  static assertCanMove(
    from: ProductChangeRequestStatus,
    to: ProductChangeRequestStatus,
  ): void {
    if (ProductChangeRequestReviewMachine.next[from].includes(to)) {
      return;
    }
    throw new AppError(
      from === 'superseded'
        ? ErrorCode.PRODUCT_CHANGE_REQUEST_SUPERSEDED
        : ErrorCode.NOT_FOUND,
    );
  }
}
