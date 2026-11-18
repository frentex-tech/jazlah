import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { ROLES_COOKIE, isPanel, parsePanels } from './lib/session';

const intl = createIntlMiddleware(routing);

/** "/en/admin/orders" → { prefix: "/en", area: "admin" } */
function splitPath(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const prefix = (routing.locales as readonly string[]).includes(parts[0] ?? '') ? `/${parts.shift()}` : '';
  return { prefix, area: parts[0], rest: parts.slice(1) };
}

export default function middleware(req: NextRequest) {
  const { prefix, area, rest } = splitPath(req.nextUrl.pathname);

  // The vendor application accepts customer sessions and visitors (VND-DSH-1), so it is not guarded here.
  const isVendorApplication = area === 'vendor' && (rest[0] === 'apply' || rest[0] === 'application');

  if (isPanel(area) && !isVendorApplication) {
    // shortcut: forgeable placeholder cookie, replaced by the real session check in ACC-DSH-1 before any page reads data.
    const panels = parsePanels(req.cookies.get(ROLES_COOKIE)?.value);
    if (!panels.includes(area)) {
      const url = req.nextUrl.clone();
      url.pathname = `${prefix}/login`;
      url.search = '';
      url.searchParams.set('panel', area);
      url.searchParams.set('next', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return intl(req);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
