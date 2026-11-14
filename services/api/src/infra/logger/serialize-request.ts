import { LOGGED_REQUEST_HEADERS } from './logged-headers.constants';
import { pickHeaders } from './pick-headers';

/**
 * The request as it appears in a request log line: id, method, the path without the
 * query string, the client address and the allowed headers (LOGGED_REQUEST_HEADERS).
 *
 * - The query string is dropped because clients put tokens and codes in it
 *   (`?token=...`), and it is not needed to find the route.
 * - The client address is Express's `req.ip`, which honours TRUST_PROXY_HOPS, so behind
 *   a load balancer it is the client, not the load balancer (`.claude/rules/http.md`).
 *
 * pino-http passes pino's standard request object, which keeps the original as `raw`.
 */
export function serializeRequest(value: unknown): Record<string, unknown> {
  const request = objectOrEmpty(value);
  const raw = objectOrEmpty(Reflect.get(request, 'raw'));
  const url: unknown =
    Reflect.get(raw, 'originalUrl') ??
    Reflect.get(raw, 'url') ??
    Reflect.get(request, 'url');
  return {
    id: Reflect.get(request, 'id'),
    method: Reflect.get(raw, 'method') ?? Reflect.get(request, 'method'),
    url: typeof url === 'string' ? url.split('?')[0] : undefined,
    ip: Reflect.get(raw, 'ip'),
    headers: pickHeaders(
      Reflect.get(raw, 'headers') ?? Reflect.get(request, 'headers'),
      LOGGED_REQUEST_HEADERS,
    ),
  };
}

function objectOrEmpty(value: unknown): object {
  return typeof value === 'object' && value !== null ? value : {};
}
