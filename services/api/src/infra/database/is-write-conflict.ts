import { driverErrorCause } from './driver-error-cause';
import { Prisma } from './generated/prisma/client';

/** How far down an error's `cause` chain to look. */
const MAX_CAUSE_DEPTH = 5;

/**
 * Whether `error`, or an error in its `cause` chain, is a serialization failure or a
 * deadlock reported by PostgreSQL (SQLSTATE 40001 or 40P01): Prisma's P2034, or a raw
 * query failure (P2010) of kind TransactionWriteConflict. Such a transaction can be run
 * again from the start.
 */
export function isWriteConflict(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth <= MAX_CAUSE_DEPTH; depth += 1) {
    if (
      current instanceof Prisma.PrismaClientKnownRequestError &&
      (current.code === 'P2034' ||
        driverErrorCause(current.meta)?.kind === 'TransactionWriteConflict')
    ) {
      return true;
    }
    if (!(current instanceof Error)) {
      return false;
    }
    current = current.cause;
  }
  return false;
}
