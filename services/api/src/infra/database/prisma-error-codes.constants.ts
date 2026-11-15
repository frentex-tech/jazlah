/**
 * The Prisma code a driver error kind corresponds to, as Prisma 7.10 assigns it to
 * model queries (`@prisma/client/runtime`). Used to read a raw query failure (P2010) the
 * same way as a model query's error. Kinds not listed keep their own code.
 */
export const DRIVER_ERROR_KIND_CODES: Readonly<Record<string, string>> = {
  DatabaseNotReachable: 'P1001',
  SocketTimeout: 'P1008',
  ConnectionClosed: 'P1017',
  LengthMismatch: 'P2000',
  UniqueConstraintViolation: 'P2002',
  ForeignKeyConstraintViolation: 'P2003',
  RestrictViolation: 'P2003',
  InvalidInputValue: 'P2007',
  ValueOutOfRange: 'P2020',
  TransactionWriteConflict: 'P2034',
  TooManyConnections: 'P2037',
};

/**
 * PostgreSQL SQLSTATEs of the constraint violations the driver adapter does not
 * classify (they arrive as P2039, or P2010 in raw SQL, of kind `postgres`):
 * 23514 check_violation and 23P01 exclusion_violation.
 */
export const CONSTRAINT_SQLSTATES: readonly string[] = ['23514', '23P01'];

/** The code `mapPrismaError` handles those constraint violations under (not a Prisma code). */
export const CONSTRAINT_VIOLATION = 'constraint-violation';

/**
 * What pg throws, as a plain Error that Prisma does not wrap, when no connection can be
 * opened in time (DATABASE_CONNECTION_TIMEOUT_MS): the database host does not answer.
 * Matched by message because pg gives it no code.
 */
export const PG_CONNECTION_TIMEOUT_MESSAGES: readonly string[] = [
  'Connection terminated due to connection timeout',
  'timeout exceeded when trying to connect',
];
