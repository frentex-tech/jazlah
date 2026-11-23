import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { ProductStatus } from './product-status.type';

/** Every allowed move, from each status. */
const ALLOWED: Readonly<Record<ProductStatus, readonly ProductStatus[]>> = {
  // A vendor submits a draft; an admin publishes a JAZLA draft directly.
  draft: ['pending_review', 'published'],
  // An admin approves or rejects.
  pending_review: ['published', 'rejected'],
  // A published product stays published: edits go through change requests.
  published: [],
  // The vendor edits it and submits again.
  rejected: ['pending_review'],
};

/**
 * The only place a product's status changes (modules.md: a state changes only through
 * the state machine that owns it). A refused move, and any edit of a product under
 * review, is PRODUCT_NOT_EDITABLE with the current status in the details.
 */
export class ProductStatusMachine {
  static canMove(from: ProductStatus, to: ProductStatus): boolean {
    return ALLOWED[from].includes(to);
  }

  static assertCanMove(from: ProductStatus, to: ProductStatus): void {
    if (!ProductStatusMachine.canMove(from, to)) {
      throw new AppError(ErrorCode.PRODUCT_NOT_EDITABLE, {
        details: { status: from },
      });
    }
  }

  /** A product under review cannot be changed until an admin decides. */
  static assertEditable(status: ProductStatus): void {
    if (status === 'pending_review') {
      throw new AppError(ErrorCode.PRODUCT_NOT_EDITABLE, {
        details: { status },
      });
    }
  }

  /**
   * Whether an edit of the content goes through a change request (a vendor's published
   * product) rather than applying at once.
   */
  static needsChangeRequest(status: ProductStatus): boolean {
    return status === 'published';
  }
}
