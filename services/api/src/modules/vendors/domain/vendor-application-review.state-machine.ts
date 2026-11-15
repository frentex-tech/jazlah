import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { VendorApplicationStatus } from './vendor-application-status.type';

/**
 * The review of a vendor application, the only place its status changes are decided:
 * pending becomes approved or rejected, once; an approved or rejected application never
 * changes again (a rejected applicant applies anew). The repository makes each change
 * with a conditional update from pending, so two admins reviewing at once cannot both
 * succeed: the loser updates nothing and gets the same refusal.
 */
export class VendorApplicationReviewMachine {
  private static readonly next: Readonly<
    Record<VendorApplicationStatus, readonly VendorApplicationStatus[]>
  > = {
    pending: ['approved', 'rejected'],
    approved: [],
    rejected: [],
  };

  /** Throws VENDOR_APPLICATION_NOT_PENDING unless `from` may become `to`. */
  static assertCanMove(
    from: VendorApplicationStatus,
    to: VendorApplicationStatus,
  ): void {
    if (!VendorApplicationReviewMachine.next[from].includes(to)) {
      throw new AppError(ErrorCode.VENDOR_APPLICATION_NOT_PENDING);
    }
  }
}
