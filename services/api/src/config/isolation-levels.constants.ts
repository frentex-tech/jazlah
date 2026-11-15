/**
 * The transaction isolation levels DATABASE_ISOLATION_LEVEL may take, named as Prisma
 * names them (Prisma.TransactionIsolationLevel). Read uncommitted is left out: PostgreSQL
 * runs it as read committed.
 */
export const ISOLATION_LEVELS = [
  'ReadCommitted',
  'RepeatableRead',
  'Serializable',
] as const;
