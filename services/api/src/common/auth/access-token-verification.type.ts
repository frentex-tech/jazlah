import type { AuthenticatedUser } from './authenticated-user.type';

/**
 * What verifying an access token found. `expired` is a token that was ours and valid
 * until its time ran out: the client refreshes. `invalid` is anything else.
 */
export type AccessTokenVerification =
  | Readonly<{ status: 'valid'; user: AuthenticatedUser }>
  | Readonly<{ status: 'expired' }>
  | Readonly<{ status: 'invalid' }>;
