/** Injection token of RefreshTokenSecrets. */
export const REFRESH_TOKEN_SECRETS = Symbol('REFRESH_TOKEN_SECRETS');

/** Making and hashing refresh tokens. Only the hash is stored. */
export interface RefreshTokenSecrets {
  /** A new unguessable token, with the hash to store. */
  generate(): Readonly<{ token: string; hash: string }>;

  /** The hash of a token a client presented. */
  hash(token: string): string;
}
