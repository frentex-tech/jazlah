import type { Panel } from './session';

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
 * saves what the user has not saved yet, then the page goes to sign-in and comes back here afterwards.
 */
export async function panelFetch<T>(panel: Panel, url: string, init: RequestInit & { beforeSignIn?: () => void } = {}): Promise<T> {
  const { beforeSignIn, ...rest } = init;
  const res = await fetch(url, { ...rest, headers: { 'Content-Type': 'application/json', 'Accept-Language': document.documentElement.lang || 'ar', ...rest.headers } }).catch(() => null);
  if (!res) throw new ApiError('NETWORK');
  if (res.status === 401) {
    beforeSignIn?.();
    const prefix = window.location.pathname.startsWith('/en/') ? '/en' : '';
    const params = new URLSearchParams({ panel, next: window.location.pathname });
    window.location.assign(`${prefix}/login?${params}`);
    return new Promise<T>(() => {}); // the page is leaving
  }
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = body as { code?: string; details?: unknown } | null;
    throw new ApiError(err?.code ?? 'NETWORK', err?.details);
  }
  return body as T;
}
