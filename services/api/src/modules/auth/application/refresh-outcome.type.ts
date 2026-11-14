import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';

/**
 * What the refresh transaction decided. It returns an outcome instead of throwing, so
 * that a revocation it made is committed before the client is refused.
 */
export type RefreshOutcome =
  | Readonly<{ kind: 'rotated'; user: AuthenticatedUser }>
  | Readonly<{ kind: 'invalid' }>
  | Readonly<{ kind: 'reused' }>
  | Readonly<{ kind: 'disabled' }>;
