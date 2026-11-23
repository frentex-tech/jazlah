import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';

/** Injection token of AccessTokens. */
export const ACCESS_TOKENS = Symbol('ACCESS_TOKENS');

/** Issuing access tokens. Verifying them is the guard's side (AccessTokenVerifier). */
export interface AccessTokens {
  /**
   * A signed token saying who `user` is: the user, the session, the single audience
   * and the organisation. It lives AUTH_ACCESS_TOKEN_TTL_SECONDS from `now`.
   */
  sign(user: AuthenticatedUser, now: Date): Promise<string>;
}
