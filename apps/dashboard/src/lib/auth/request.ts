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

/** The user's address from the deployment's proxy header (first hop), forwarded to the API. */
export function clientIp(req: NextRequest): string | undefined {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined;
}

/** HTTP status for an API error code passed back to our pages. */
export const statusOf = (code: string) => (code === 'RATE_LIMITED' ? 429 : code === 'NETWORK' ? 502 : 400);
