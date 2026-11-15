import type { Prisma } from './generated/prisma/client';

/** How `IdempotencyRunner` stores a result in `idempotency_keys.outcome`. */
export type StoredOutcome = Readonly<{ value: Prisma.JsonValue }>;
