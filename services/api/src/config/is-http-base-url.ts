/**
 * Whether a value is an absolute `http://` or `https://` URL with a host, usable as a
 * base that paths are appended to: no query, no fragment, no credentials and no
 * trailing slash (`https://cdn.example.com/media`, `http://localhost:9002`). It never
 * echoes the value.
 */
export function isHttpBaseUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    // Not a URL at all: the schema reports it, without the value.
    return false;
  }
  return (
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    url.hostname.length > 0 &&
    url.username === '' &&
    url.password === '' &&
    url.search === '' &&
    url.hash === '' &&
    !value.endsWith('/') &&
    // `new URL` adds a slash after a bare host; compare without it.
    `${url.origin}${url.pathname === '/' ? '' : url.pathname}` === value
  );
}
