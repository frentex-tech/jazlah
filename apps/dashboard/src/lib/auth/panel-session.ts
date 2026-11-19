import { NextResponse, type NextRequest } from 'next/server';
import { PANELS_COOKIE, accessCookie, parsePanels, refreshCookie, type Panel } from '../session';
import { authBackend, type Tokens } from './backend';
import { clearPanel, writePanels, writeTokens } from './cookies';
import { clientIp, isSameOriginJson, sameOrigin } from './request';

/** What a panel route's API call returns: data (null → 204), or the API's error code with its HTTP status. */
export type ApiResult<T> =
  | { ok: true; data: T; status?: number }
  | { ok: false; code: string; status: number; details?: unknown };

/** Codes that mean the panel session is over: the page sends the user to sign in again (docs/frontend/errors.md). */
const SIGNED_OUT = new Set(['UNAUTHORIZED', 'FORBIDDEN', 'REFRESH_TOKEN_INVALID', 'ACCESS_TOKEN_EXPIRED', 'ACCOUNT_DISABLED', 'VENDOR_SUSPENDED']);

/**
 * Runs one API call for a panel route handler with the user's access token. API routes are outside the middleware,
 * so this does what the middleware does for pages: refresh a missing access token, retry once on
 * ACCESS_TOKEN_EXPIRED, and write the new cookies on the response. When the session is over it clears the panel and
 * answers 401 `{ code }`; the page then sends the user to /login?panel=…&next=… (lib/panel-fetch.ts).
 * Mutating calls must come from our own pages (same-origin, and JSON when they carry a body): SameSite=Lax alone
 * lets sibling subdomains through.
 */
export async function withPanelSession<T>(
  req: NextRequest,
  panel: Panel,
  call: (accessToken: string) => Promise<ApiResult<T>>,
): Promise<NextResponse> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const hasBody = req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT';
    if (!(hasBody ? isSameOriginJson(req) : sameOrigin(req))) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });
  }

  const panels = parsePanels(req.cookies.get(PANELS_COOKIE)?.value);
  const refreshToken = req.cookies.get(refreshCookie(panel))?.value;
  const signedOut = (code: string) => {
    const res = NextResponse.json({ code }, { status: 401 });
    if (refreshToken) {
      clearPanel(res, panel);
      writePanels(res, panels.filter((p) => p !== panel));
    }
    return res;
  };
  if (!panels.includes(panel) || !refreshToken) return signedOut('UNAUTHORIZED');

  let token = req.cookies.get(accessCookie(panel))?.value;
  let fresh: Tokens | undefined;
  const refresh = async () => {
    const r = await authBackend().refresh(refreshToken, clientIp(req));
    if (!r.ok) return r.code === 'NETWORK' ? NextResponse.json({ code: 'NETWORK' }, { status: 502 }) : signedOut(r.code);
    fresh = r.data;
    token = r.data.accessToken;
    return null;
  };

  if (!token) {
    const failed = await refresh();
    if (failed) return failed;
  }
  let result = await call(token!);
  if (!result.ok && result.code === 'ACCESS_TOKEN_EXPIRED' && !fresh) {
    const failed = await refresh();
    if (failed) return failed;
    result = await call(token!);
  }

  if (!result.ok && SIGNED_OUT.has(result.code)) return signedOut(result.code);
  const res = result.ok
    ? result.data === null
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json(result.data, { status: result.status ?? 200 })
    : NextResponse.json({ code: result.code, details: result.details }, { status: result.status });
  if (fresh) writeTokens(res, panel, fresh);
  return res;
}
