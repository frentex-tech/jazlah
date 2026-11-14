/** The `iss` claim of every access token; a token with another issuer is not ours. */
export const ACCESS_TOKEN_ISSUER = 'jazla-api';

/** The one signing algorithm. Verification accepts no other, `none` included. */
export const ACCESS_TOKEN_ALGORITHM = 'HS256';
