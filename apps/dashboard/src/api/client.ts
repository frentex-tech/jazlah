import createClient from 'openapi-fetch';
import type { ApiResult } from '@/lib/auth/panel-session';
import type { components, paths } from './schema';

export type ErrorResponse = components['schemas']['ErrorResponseDto'];
export type Schemas = components['schemas'];

const TIMEOUT_MS = 5000;

/**
 * Typed API client (docs/frontend/client-generation.md). Server-side only: tokens live in HTTP-only cookies. A slow API
 * must not hang a page: calls give up after 5 s, reported as NETWORK.
 */
export const apiClient = (baseUrl = process.env.API_URL ?? 'http://localhost:3000') =>
  createClient<paths>({ baseUrl, fetch: (r: Request) => fetch(r, { signal: AbortSignal.timeout(TIMEOUT_MS) }) });

export const apiHeaders = (token: string | null, lang: string) => ({ 'Accept-Language': lang, ...(token ? { Authorization: `Bearer ${token}` } : {}) });

/** One API call as an ApiResult for withPanelSession: the data (null for an `empty` 204), or the API's error code. */
export async function apiCall<T>(p: Promise<{ data?: T; error?: unknown; response: Response }>, empty = false): Promise<ApiResult<T>> {
  try {
    const { data, error, response } = await p;
    if (!error && (empty || data !== undefined)) return { ok: true, data: (empty ? null : data) as T, status: response.status };
    const e = error as ErrorResponse | undefined;
    return { ok: false, code: e?.code ?? 'NETWORK', status: e?.code ? response.status : 502, details: e?.details };
  } catch {
    return { ok: false, code: 'NETWORK', status: 502 };
  }
}
