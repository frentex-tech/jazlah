import type { AccessTokenVerification } from './access-token-verification.type';

/**
 * Verifies an access token. Declared here so the authentication guard, which lives in
 * common, depends on an interface and not on the auth module (R1); the auth module
 * provides the implementation under ACCESS_TOKEN_VERIFIER.
 */
export interface AccessTokenVerifier {
  /** Never throws: a token that cannot be trusted is `invalid`. */
  verify(token: string): Promise<AccessTokenVerification>;
}
