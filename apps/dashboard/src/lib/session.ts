// Session cookies shared by the middleware (edge) and the auth route handlers. All HTTP-only.
export const PANELS = ['admin', 'vendor', 'kitchen'] as const;
export type Panel = (typeof PANELS)[number];

export const isPanel = (v: unknown): v is Panel => PANELS.includes(v as Panel);

/** Comma list of the panels with a live session, e.g. "admin,vendor". Lives 12 h and slides on activity (idle timeout). */
export const PANELS_COOKIE = 'jz_panels';
export const IDLE_SECONDS = 12 * 60 * 60;

/** Per-panel cookies: refresh token, access token, masked phone shown in the top bar. */
export const refreshCookie = (p: Panel) => `jz_rt_${p}`;
export const accessCookie = (p: Panel) => `jz_at_${p}`;
export const phoneCookie = (p: Panel) => `jz_ph_${p}`;

export const cookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export function parsePanels(raw: string | undefined): Panel[] {
  return [...new Set((raw ?? '').split(',').filter(isPanel))];
}

/** Only same-site paths are accepted as a post-login destination (no open redirect). */
export function safeNext(next: string | null | undefined): string | null {
  return next && next.startsWith('/') && !next.startsWith('//') && !/[\\\x00-\x1f]/.test(next) ? next : null;
}

/** The panel a path belongs to: "/en/vendor/orders" → "vendor". */
export function panelOfPath(path: string): Panel | null {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'ar' || parts[0] === 'en') parts.shift();
  return isPanel(parts[0]) ? parts[0] : null;
}
