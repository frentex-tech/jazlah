/** The prefix of every route except the API documentation (`/v1/...`). */
export const GLOBAL_PREFIX = 'v1';

/** Response headers a browser client may read across origins (CORS). */
export const CORS_EXPOSED_HEADERS = [
  'x-request-id',
  'Retry-After',
  'X-RateLimit-Limit',
  'X-RateLimit-Remaining',
  'X-RateLimit-Reset',
] as const;

/** The only request body types the API reads (requireJsonBody, the JSON parser). */
export const JSON_BODY_TYPES = [
  'application/json',
  'application/*+json',
] as const;
