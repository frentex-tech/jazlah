import type { Schemas } from '@/api/client';
import type { Session } from './session';

// The API's codes the pages compare against, typed by the generated ErrorCode (a renamed code fails the typecheck).
export const PERMISSION_DENIED: Schemas['ErrorCode'] = 'PERMISSION_DENIED';
export const VENDOR_CR_EXISTS: Schemas['ErrorCode'] = 'VENDOR_CR_EXISTS';
export const PRODUCT_NOT_SUBMITTABLE: Schemas['ErrorCode'] = 'PRODUCT_NOT_SUBMITTABLE';
/** A route whose task has not landed yet (501): the page shows «قريبًا», never data of its own. */
export const NOT_IMPLEMENTED: Schemas['ErrorCode'] = 'NOT_IMPLEMENTED';
export const ORDER_TRANSITION_NOT_ALLOWED: Schemas['ErrorCode'] = 'ORDER_TRANSITION_NOT_ALLOWED';
export const COUPON_CODE_TAKEN: Schemas['ErrorCode'] = 'COUPON_CODE_TAKEN';

// A refused permission is 403 PERMISSION_DENIED: the session stays (not in panel-session's SIGNED_OUT) and the pages
// show their not-allowed state. shortcut: no API route returns it until ADM-API-1 adds the permission checks (#111), so
// only the mocks' `-limited` token shows it.
export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly details?: unknown,
  ) {
    super(code);
  }
}

/** What a failed page load shows: not allowed (403 PERMISSION_DENIED), coming soon (501 NOT_IMPLEMENTED), else the error state. */
export function failedState(e: unknown): 'denied' | 'soon' | 'error' {
  const code = e instanceof ApiError ? e.code : '';
  return code === PERMISSION_DENIED ? 'denied' : code === NOT_IMPLEMENTED ? 'soon' : 'error';
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
