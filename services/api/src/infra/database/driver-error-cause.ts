/**
 * The pg driver's error as Prisma 7 reports it through the driver adapter, at
 * `meta.driverAdapterError.cause`: `{ kind, originalCode, originalMessage, constraint?, ... }`.
 * `kind` names the failure (UniqueConstraintViolation, TransactionWriteConflict,
 * `postgres` for anything unclassified); `originalCode` is the PostgreSQL SQLSTATE.
 */
export function driverErrorCause(
  meta: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  const adapterError = meta?.driverAdapterError;
  if (typeof adapterError !== 'object' || adapterError === null) {
    return undefined;
  }
  const cause: unknown = Reflect.get(adapterError, 'cause');
  return typeof cause === 'object' && cause !== null
    ? (cause as Record<string, unknown>)
    : undefined;
}
