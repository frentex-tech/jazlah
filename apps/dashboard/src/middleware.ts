import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { REFRESH_ENDS_SESSION, authBackend } from './lib/auth/backend';
import { clearPanel, writePanels, writeTokens } from './lib/auth/cookies';
import { clientIp } from './lib/auth/request';
import { PANELS_COOKIE, accessCookie, isPanel, parseSessions, refreshCookie, type Panel } from './lib/session';

const intl = createIntlMiddleware(routing);

/** "/en/admin/orders" → { prefix: "/en", area: "admin", rest: ["orders"] } */
function splitPath(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const prefix = (routing.locales as readonly string[]).includes(parts[0] ?? '') ? `/${parts.shift()}` : '';
  return { prefix, area: parts[0], rest: parts.slice(1) };
}

function redirectTo(req: NextRequest, pathname: string, params: Record<string, string> = {}) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = new URLSearchParams(params).toString();
  return NextResponse.redirect(url);
}

/** A refresh refused because of the account itself: the sign-in page says why (docs/frontend/errors.md). */
const reasonOf = (code: string): Record<string, string> =>
  code === 'ACCOUNT_DISABLED' ? { reason: 'disabled' } : code === 'VENDOR_SUSPENDED' ? { reason: 'suspended' } : {};

/** Where a signed-in user lands: their only panel, or the picker. */
const home = (prefix: string, panels: Panel[]) => (panels.length === 1 ? `${prefix}/${panels[0]}` : `${prefix}/login/choose`);

export default async function middleware(req: NextRequest) {
  const { prefix, area, rest } = splitPath(req.nextUrl.pathname);
  // Every live session, the customer one too: rewriting the cookie must keep it. Only staff panels open panels.
  const sessions = parseSessions(req.cookies.get(PANELS_COOKIE)?.value);
  // A panel counts as signed in only with its refresh token too, so a half-cleared session can't loop /login ⇄ /admin.
  const live = sessions.filter(isPanel).filter((p) => req.cookies.get(refreshCookie(p))?.value);

  // Start and sign-in pages: signed-in staff go straight to their panel.
  if (area === undefined || (area === 'login' && rest.length === 0)) {
    const asked = req.nextUrl.searchParams.get('panel');
    if (isPanel(asked) && live.includes(asked)) return redirectTo(req, `${prefix}/${asked}`);
    if (!isPanel(asked) && live.length > 0) return redirectTo(req, home(prefix, live));
    if (area === undefined) return redirectTo(req, `${prefix}/login`);
  }
  if (area === 'login' && rest[0] === 'choose' && live.length < 2) {
    return redirectTo(req, live.length ? home(prefix, live) : `${prefix}/login`);
  }

  // The vendor application is for visitors and customer sessions (VND-DSH-1): its pages check the customer session.
  // Here, as for the staff panels: the idle timeout slides, or, when it passed, the API session is ended too.
  const isVendorApplication = area === 'vendor' && (rest[0] === 'apply' || rest[0] === 'application');
  if (isVendorApplication) {
    const res = intl(req);
    const customerToken = req.cookies.get(refreshCookie('customer'))?.value;
    if (customerToken && sessions.includes('customer')) writePanels(res, sessions);
    else if (customerToken) {
      await authBackend().logout(customerToken, clientIp(req));
      clearPanel(res, 'customer');
    }
    return res;
  }
  if (!isPanel(area)) return intl(req);

  const refreshToken = req.cookies.get(refreshCookie(area))?.value;
  if (!sessions.includes(area) || !refreshToken) {
    const out = redirectTo(req, `${prefix}/login`, { panel: area, next: req.nextUrl.pathname });
    // Idle timeout passed (jz_panels expired) while the refresh token is still here: end that API session too.
    if (refreshToken) {
      await authBackend().logout(refreshToken, clientIp(req));
      clearPanel(out, area);
    }
    return out;
  }

  const res = intl(req);
  writePanels(res, sessions); // slide the 12 h idle timeout

  // Refresh an expired access token on page loads and in-app navigations, never on prefetches, so parallel prefetches
  // don't spend the one-use refresh token twice.
  // shortcut: no cross-tab lock; two tabs (or a page and its API call) refreshing in the same second could spend the
  // one-use refresh token twice and end the session. Server components of the same request still see the old cookies.
  // Fix before the first page that fetches data on the server: forward the new token in request headers, and add a
  // short-lived refresh lock or server-side session store (#145).
  const navigation =
    req.headers.get('sec-fetch-dest') === 'document' || (req.headers.get('rsc') === '1' && !req.headers.get('next-router-prefetch'));
  if (!req.cookies.get(accessCookie(area)) && navigation) {
    const r = await authBackend().refresh(refreshToken, clientIp(req));
    if (r.ok) writeTokens(res, area, r.data);
    else if (REFRESH_ENDS_SESSION.has(r.code)) {
      const out = redirectTo(req, `${prefix}/login`, { panel: area, next: req.nextUrl.pathname, ...reasonOf(r.code) });
      clearPanel(out, area);
      writePanels(out, sessions.filter((p) => p !== area));
      return out;
    }
  }
  return res;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
