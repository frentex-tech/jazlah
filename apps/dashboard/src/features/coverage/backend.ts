// Coverage zones behind one interface: the API (/v1/admin/coverage-zones, openapi-fetch) or, for the Playwright smoke
// tests and local work without an API, an in-memory mock (DASHBOARD_API_MOCK=1).
import { apiCall as call, apiClient, apiHeaders as headers } from '@/api/client';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type { CoverageCheck, CoverageZone, CreateZone, UpdateZone } from './types';

export interface CoverageBackend {
  /** Every zone, newest first: follows `nextCursor` to the end (zones are few; the page lists them on the client). */
  list(token: string, lang: string): Promise<ApiResult<CoverageZone[]>>;
  create(token: string, lang: string, input: CreateZone): Promise<ApiResult<CoverageZone>>;
  update(token: string, lang: string, id: string, input: UpdateZone): Promise<ApiResult<CoverageZone>>;
  remove(token: string, lang: string, id: string): Promise<ApiResult<null>>;
  check(lat: number, lng: number, lang: string): Promise<ApiResult<CoverageCheck>>;
}

const MAX_PAGES = 20; // 1000 zones: far beyond any real list, stops a cursor loop

function apiBackend(): CoverageBackend {
  const api = apiClient();
  return {
    async list(token, lang) {
      const items: CoverageZone[] = [];
      let cursor: string | undefined;
      for (let i = 0; i < MAX_PAGES; i++) {
        const r = await call(api.GET('/v1/admin/coverage-zones', { params: { query: { limit: 50, cursor } }, headers: headers(token, lang) }));
        if (!r.ok) return r;
        items.push(...r.data.items);
        if (!r.data.nextCursor) break;
        cursor = r.data.nextCursor;
      }
      return { ok: true, data: items };
    },
    create: (token, lang, body) => call(api.POST('/v1/admin/coverage-zones', { body, headers: headers(token, lang) })),
    update: (token, lang, id, body) =>
      call(api.PATCH('/v1/admin/coverage-zones/{id}', { params: { path: { id } }, body, headers: headers(token, lang) })),
    async remove(token, lang, id) {
      const r = await call(api.DELETE('/v1/admin/coverage-zones/{id}', { params: { path: { id } }, headers: headers(token, lang) }), true);
      return r.ok ? { ok: true, data: null } : r;
    },
    check: (lat, lng, lang) => call(api.GET('/v1/public/coverage/check', { params: { query: { lat, lng } }, headers: headers(null, lang) })),
  };
}

export function coverageBackend(): CoverageBackend {
  return mockBackends()?.coverage ?? apiBackend();
}
