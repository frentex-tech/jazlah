import type { Session } from './session';

// shortcut: the pages read a refused permission as `NOT_ALLOWED` (the mocks' code), while the API answers 403 `FORBIDDEN`,
// so against the API a refusal shows the error state, not "not allowed"; switch every check to the code the API session
// picks (A15) (#88).
export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly details?: unknown,
  ) {
    super(code);
  }
}

/**
 * Browser fetch to our panel API routes (lib/auth/panel-session.ts). A 401 means the session is over: `beforeSignIn`
 * saves what the user has not saved yet, then the page goes to sign-in and comes back here afterwards. A customer
 * session signs in again on the vendor application itself. `stayOn` lists the codes the page shows itself instead
 * (the session is still ended on the server): they are thrown as ApiError.
 */
export async function panelFetch<T>(
  panel: Session,
  url: string,
  init: RequestInit & { beforeSignIn?: () => void; stayOn?: string[] } = {},
): Promise<T> {
  const { beforeSignIn, stayOn, ...rest } = init;
  const res = await fetch(url, { ...rest, headers: { 'Content-Type': 'application/json', 'Accept-Language': document.documentElement.lang || 'ar', ...rest.headers } }).catch(() => null);
  if (!res) throw new ApiError('NETWORK');
  if (res.status === 401) {
    const code = ((await res.json().catch(() => null)) as { code?: string } | null)?.code;
    if (code && stayOn?.includes(code)) throw new ApiError(code);
    beforeSignIn?.();
    const reason = code === 'ACCOUNT_DISABLED' ? 'disabled' : code === 'VENDOR_SUSPENDED' ? 'suspended' : undefined;
    const prefix = window.location.pathname.startsWith('/en/') ? '/en' : '';
    if (panel === 'customer') window.location.assign(`${prefix}/vendor/apply${reason ? `?reason=${reason}` : ''}`);
    else window.location.assign(`${prefix}/login?${new URLSearchParams({ panel, next: window.location.pathname, ...(reason && { reason }) })}`);
    return new Promise<T>(() => {}); // the page is leaving
  }
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = body as { code?: string; details?: unknown } | null;
    throw new ApiError(err?.code ?? 'NETWORK', err?.details);
  }
  return body as T;
}
