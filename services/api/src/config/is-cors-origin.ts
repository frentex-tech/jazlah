/** The CORS origin that allows every site. Refused in production (env.schema.ts). */
export const CORS_WILDCARD = '*';

/**
 * Whether a value is one entry of CORS_ORIGINS: the wildcard, or a browser origin
 * exactly as a browser sends it in the Origin header: `http://` or `https://`, a host,
 * an optional port, and nothing after it (no path, no trailing slash, no wildcard host).
 */
export function isCorsOrigin(value: string): boolean {
  if (value === CORS_WILDCARD) {
    return true;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return (
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    url.origin === value &&
    // `https://*.example.com` parses, but CORS compares origins literally: refuse it.
    !url.hostname.includes('*')
  );
}
