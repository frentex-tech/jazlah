/**
 * The request headers a request log line may contain. Every other header (Authorization,
 * Cookie, API keys, anything a client or proxy adds) is left out, so a new secret
 * header is safe by default. Add a header here only if it carries no secret and no
 * personal data.
 */
export const LOGGED_REQUEST_HEADERS: readonly string[] = [
  'accept',
  'accept-language',
  'content-length',
  'content-type',
  'host',
  'origin',
  'user-agent',
  'x-request-id',
];

/** The response headers a request log line may contain (no Set-Cookie). */
export const LOGGED_RESPONSE_HEADERS: readonly string[] = [
  'content-length',
  'content-type',
  'retry-after',
  'x-request-id',
];
