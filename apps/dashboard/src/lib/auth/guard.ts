import type { NextRequest } from 'next/server';
import { PANELS_COOKIE, accessCookie, parsePanels, refreshCookie, type Panel } from '../session';

/**
 * API routes are outside the middleware, so they read the panel session themselves. Cookies can be forged, so this
 * only gates the call; the API checks the access token on every request.
 */
export function panelAuth(req: NextRequest, panel: Panel): { accessToken: string } | null {
  const accessToken = req.cookies.get(accessCookie(panel))?.value;
  const live = parsePanels(req.cookies.get(PANELS_COOKIE)?.value).includes(panel) && !!req.cookies.get(refreshCookie(panel))?.value;
  return live && accessToken ? { accessToken } : null;
}
