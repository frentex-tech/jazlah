import type { NextResponse } from 'next/server';
import {
  IDLE_SECONDS, PANELS, PANELS_COOKIE, accessCookie, cookieBase, phoneCookie, refreshCookie, type Panel,
} from '../session';
import type { Tokens } from './backend';

// Access cookie expires a minute early, so the middleware refreshes before the API answers ACCESS_TOKEN_EXPIRED.
export function writeTokens(res: NextResponse, panel: Panel, t: Tokens) {
  res.cookies.set(accessCookie(panel), t.accessToken, { ...cookieBase, maxAge: Math.max(60, t.accessTokenExpiresInSeconds - 60) });
  res.cookies.set(refreshCookie(panel), t.refreshToken, { ...cookieBase, maxAge: t.refreshTokenExpiresInSeconds });
}

/** (Re)sets the idle-timeout cookie: 12 h after the last request, every panel session is closed. */
export function writePanels(res: NextResponse, panels: Panel[]) {
  res.cookies.set(PANELS_COOKIE, panels.join(','), { ...cookieBase, maxAge: IDLE_SECONDS });
}

export function writeSignIn(res: NextResponse, panel: Panel, t: Tokens, phone: string, current: Panel[]) {
  writeTokens(res, panel, t);
  res.cookies.set(phoneCookie(panel), phone, { ...cookieBase, maxAge: t.refreshTokenExpiresInSeconds });
  writePanels(res, [...new Set([...current, panel])]);
}

export function clearPanel(res: NextResponse, panel: Panel) {
  for (const name of [accessCookie(panel), refreshCookie(panel), phoneCookie(panel)]) res.cookies.delete(name);
}

export function clearAll(res: NextResponse) {
  PANELS.forEach((p) => clearPanel(res, p));
  res.cookies.delete(PANELS_COOKIE);
}
