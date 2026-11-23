import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { VendorStatus } from './vendor-status.type';

/**
 * A vendor's status, the only place its changes are decided: an admin suspends an
 * active vendor and reinstates a suspended one. Suspending a suspended vendor, or
 * reinstating an active one, is refused with CONFLICT (details.reason says which), so
 * the audit log records each change once. The repository makes each change with a
 * conditional update on the current status.
 */
export class VendorStatusMachine {
  private static readonly refusals: Readonly<
    Record<VendorStatus, Readonly<Record<VendorStatus, string | null>>>
  > = {
    active: { active: 'VENDOR_NOT_SUSPENDED', suspended: null },
    suspended: { active: null, suspended: 'VENDOR_ALREADY_SUSPENDED' },
  };

  /** Throws CONFLICT unless a vendor in `from` may move to `to`. */
  static assertCanMove(from: VendorStatus, to: VendorStatus): void {
    const reason = VendorStatusMachine.refusals[from][to];
    if (reason !== null) {
      throw new AppError(ErrorCode.CONFLICT, { details: { reason } });
    }
  }
}
