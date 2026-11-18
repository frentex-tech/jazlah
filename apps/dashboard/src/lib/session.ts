// Session cookies shared by the middleware (edge) and the auth route handlers (node). No secrets here.
export const PANELS = ['admin', 'vendor', 'kitchen'] as const;
export type Panel = (typeof PANELS)[number];

export const isPanel = (v: unknown): v is Panel => PANELS.includes(v as Panel);

/** Comma list of the panels with a live session, e.g. "admin,vendor". Readable by the middleware only (HTTP-only). */
export const ROLES_COOKIE = 'jz_panels';

export function parsePanels(raw: string | undefined): Panel[] {
  return (raw ?? '').split(',').filter(isPanel);
}
