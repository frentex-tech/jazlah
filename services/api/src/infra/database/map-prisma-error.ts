import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { ConstraintDetails } from './constraint-details.type';
import { driverErrorCause } from './driver-error-cause';
import { Prisma } from './generated/prisma/client';
import {
  CONSTRAINT_SQLSTATES,
  CONSTRAINT_VIOLATION,
  DRIVER_ERROR_KIND_CODES,
  PG_CONNECTION_TIMEOUT_MESSAGES,
} from './prisma-error-codes.constants';

/**
 * Turns a known database error into an AppError and throws it; rethrows anything else
 * unchanged, so it ends as INTERNAL_ERROR. Repositories call it in their `catch`
 * (after translating the constraints they know, rule 17a), and `runInTransaction`
 * applies it to what escapes a transaction:
 *
 *   try { return await this.db.client.auditLog.create({ data }); } catch (error) { mapPrismaError(error); }
 *
 * - P2002 unique, P2003 foreign key, a check or exclusion constraint (P2039 with
 *   SQLSTATE 23514 or 23P01) -> CONFLICT, details { constraint?, fields? }
 * - P2025 record not found -> NOT_FOUND
 * - P2000 value too long, P2007 invalid value (a malformed UUID), P2020 out of range
 *   -> BAD_REQUEST
 * - P2034 serialization failure or deadlock -> TRANSACTION_CONFLICT (409); inside
 *   `runInTransaction` it is first retried
 * - P2028 transaction timed out, the database unreachable (P1001, P1008, P1017, a pg
 *   connection timeout) or out of connections (P2037) -> SERVICE_UNAVAILABLE (503)
 * - P2010, a failed raw query: by the driver error it carries, as above, so a unique
 *   violation in raw SQL is CONFLICT like P2002
 *
 * The exception filter in src/common knows nothing about Prisma; this is the only place
 * that reads Prisma error codes. Details carry constraint and field names, never values.
 */
export function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const code = effectiveCode(error);
    switch (code) {
      case 'P2002':
      case 'P2003':
        throw new AppError(ErrorCode.CONFLICT, {
          details: constraintDetails(error.meta),
          cause: error,
        });
      case CONSTRAINT_VIOLATION:
        throw new AppError(ErrorCode.CONFLICT, {
          details: checkConstraintDetails(error.meta),
          cause: error,
        });
      case 'P2025':
        throw new AppError(ErrorCode.NOT_FOUND, { cause: error });
      case 'P2000':
      case 'P2007':
      case 'P2020':
        throw new AppError(ErrorCode.BAD_REQUEST, { cause: error });
      case 'P2034':
        throw new AppError(ErrorCode.TRANSACTION_CONFLICT, { cause: error });
      case 'P1001':
      case 'P1008':
      case 'P1017':
      case 'P2028':
      case 'P2037':
        throw new AppError(ErrorCode.SERVICE_UNAVAILABLE, { cause: error });
    }
  }
  if (
    error instanceof Error &&
    PG_CONNECTION_TIMEOUT_MESSAGES.includes(error.message)
  ) {
    throw new AppError(ErrorCode.SERVICE_UNAVAILABLE, { cause: error });
  }
  throw error;
}

/**
 * The error's code, or for a raw query failure (P2010) and an unclassified database
 * error (P2039) the code the driver error it carries corresponds to.
 */
function effectiveCode(error: Prisma.PrismaClientKnownRequestError): string {
  if (error.code !== 'P2010' && error.code !== 'P2039') {
    return error.code;
  }
  const cause = driverErrorCause(error.meta);
  const kind = cause?.kind;
  if (kind === 'postgres') {
    const sqlState = cause?.originalCode;
    return typeof sqlState === 'string' &&
      CONSTRAINT_SQLSTATES.includes(sqlState)
      ? CONSTRAINT_VIOLATION
      : error.code;
  }
  return typeof kind === 'string'
    ? (DRIVER_ERROR_KIND_CODES[kind] ?? error.code)
    : error.code;
}

/**
 * Reads the constraint from the error metadata. With the pg driver adapter, Prisma 7
 * reports `driverAdapterError.cause.constraint` as `{ index }` (the constraint name) or
 * `{ fields }`; older engines reported `target`. A primary key violation names the
 * `id` field, since every primary key is `id` (.claude/rules/database.md).
 */
function constraintDetails(
  meta: Record<string, unknown> | undefined,
): ConstraintDetails {
  const constraint = objectAt(driverErrorCause(meta), 'constraint');
  const name = stringAt(constraint, 'index');
  const fields = stringsAt(constraint, 'fields') ?? stringsAt(meta, 'target');
  if (fields) {
    return name ? { constraint: name, fields } : { fields };
  }
  if (name?.endsWith('_pkey')) {
    return { constraint: name, fields: ['id'] };
  }
  return name ? { constraint: name } : {};
}

/**
 * A check or exclusion violation carries the constraint's name only in PostgreSQL's
 * message ('... violates check constraint "orders_total_check"'). Its DETAIL holds the
 * whole failing row and is never read.
 */
function checkConstraintDetails(
  meta: Record<string, unknown> | undefined,
): ConstraintDetails {
  const message = stringAt(driverErrorCause(meta), 'originalMessage');
  const name = message?.match(/constraint "([^"]+)"/)?.[1];
  return name ? { constraint: name } : {};
}

function objectAt(
  value: Record<string, unknown> | undefined,
  key: string,
): Record<string, unknown> | undefined {
  const child = value?.[key];
  return typeof child === 'object' && child !== null
    ? (child as Record<string, unknown>)
    : undefined;
}

function stringAt(
  value: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const child = value?.[key];
  return typeof child === 'string' ? child : undefined;
}

function stringsAt(
  value: Record<string, unknown> | undefined,
  key: string,
): string[] | undefined {
  const child = value?.[key];
  return Array.isArray(child) && child.every((item) => typeof item === 'string')
    ? child
    : undefined;
}
