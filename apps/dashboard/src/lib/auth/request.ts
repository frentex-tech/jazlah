import type { NextRequest } from 'next/server';

/**
 * Login CSRF guard: auth calls must come from our own pages. A cross-site form can post a JSON-looking body as
 * text/plain, so both the fetch metadata and the content type are checked.
 */
export function isSameOriginJson(req: NextRequest): boolean {
  return sameOrigin(req) && (req.headers.get('content-type') ?? '').startsWith('application/json');
}

export function sameOrigin(req: NextRequest): boolean {
  const site = req.headers.get('sec-fetch-site');
  if (site) return site === 'same-origin';
  const origin = req.headers.get('origin');
  return !!origin && new URL(origin).host === req.headers.get('host');
}

/**
 * The user's address, forwarded to the API for its per-address limits. Read only from the header named by
 * CLIENT_IP_HEADER, which the deployment's edge proxy must set and overwrite (e.g. x-real-ip). Never the first
 * X-Forwarded-For entry: the client writes that one. With CLIENT_IP_HEADER=x-forwarded-for, the right-most entry is
 * used, the one our edge appended. Unset: nothing is forwarded, so the API sees the dashboard server.
 */
export function clientIpFrom(headers: Headers, header: string | undefined): string | undefined {
  const raw = header ? headers.get(header) : null;
  const ip = (header?.toLowerCase() === 'x-forwarded-for' ? raw?.split(',').at(-1) : raw)?.trim();
  return ip && /^[0-9a-fA-F:.]{2,45}$/.test(ip) ? ip : undefined;
}

export const clientIp = (req: NextRequest) => clientIpFrom(req.headers, process.env.CLIENT_IP_HEADER);

/** HTTP status for an API error code passed back to our pages. */
export const statusOf = (code: string) => (code === 'RATE_LIMITED' ? 429 : code === 'NETWORK' ? 502 : 400);
