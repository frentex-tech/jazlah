import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { mapPrismaError } from './map-prisma-error';

/**
 * mapPrismaError, after translating the constraints a repository knows into their own
 * codes (database.md, 17a): a violation of a constraint named in `codes` (a unique
 * index, a foreign key, a check constraint, by its database name) becomes that code;
 * anything else is mapped as mapPrismaError maps it. In a repository's `catch`:
 *
 *   mapConstraintViolation(error, {
 *     vendor_applications_applicant_id_pending_key: ErrorCode.VENDOR_APPLICATION_ALREADY_PENDING,
 *   });
 *
 * Outside a transaction only: inside one, the failed statement has already ended it.
 */
export function mapConstraintViolation(
  error: unknown,
  codes: Readonly<Record<string, ErrorCode>>,
): never {
  try {
    mapPrismaError(error);
  } catch (mapped) {
    const constraint = constraintOf(mapped);
    const code =
      constraint === undefined || !Object.hasOwn(codes, constraint)
        ? undefined
        : codes[constraint];
    if (code !== undefined) {
      throw new AppError(code, { cause: error });
    }
    throw mapped;
  }
}

/** The constraint named by a CONFLICT that mapPrismaError raised, if any. */
function constraintOf(error: unknown): string | undefined {
  if (!(error instanceof AppError) || error.code !== ErrorCode.CONFLICT) {
    return undefined;
  }
  const details: unknown = error.details;
  return typeof details === 'object' &&
    details !== null &&
    'constraint' in details &&
    typeof details.constraint === 'string'
    ? details.constraint
    : undefined;
}
