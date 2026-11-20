// Session cookies shared by the middleware (edge) and the auth route handlers. All HTTP-only.
export const PANELS = ['admin', 'vendor', 'kitchen'] as const;
export type Panel = (typeof PANELS)[number];

export const isPanel = (v: unknown): v is Panel => PANELS.includes(v as Panel);

/**
 * Every session the dashboard keeps: the staff panels, and the customer session of the vendor application (VND-DSH-1).
 * A customer session never opens a staff panel: panel guards read only their own panel's cookies (and `parsePanels`).
 */
export const SESSIONS = [...PANELS, 'customer'] as const;
export type Session = (typeof SESSIONS)[number];
const isSession = (v: unknown): v is Session => SESSIONS.includes(v as Session);

/** Comma list of the sessions that are live, e.g. "admin,vendor". Lives 12 h and slides on activity (idle timeout). */
export const PANELS_COOKIE = 'jz_panels';
export const IDLE_SECONDS = 12 * 60 * 60;

/** Per-panel cookies: refresh token, access token, masked phone shown in the top bar. */
export const refreshCookie = (p: Session) => `jz_rt_${p}`;
export const accessCookie = (p: Session) => `jz_at_${p}`;
export const phoneCookie = (p: Session) => `jz_ph_${p}`;

export const cookieBase = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export function parseSessions(raw: string | undefined): Session[] {
  return [...new Set((raw ?? '').split(',').filter(isSession))];
}

/** The staff panels only: what the panel guards, the sign-in redirects and the panel picker look at. */
export const parsePanels = (raw: string | undefined): Panel[] => parseSessions(raw).filter(isPanel);

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
