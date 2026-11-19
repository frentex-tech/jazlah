// Coverage zones behind one interface: the API (/v1/admin/coverage-zones, openapi-fetch) or, for the Playwright smoke
// tests and local work without an API, an in-memory mock (DASHBOARD_API_MOCK=1).
import createClient from 'openapi-fetch';
import type { components, paths } from '@/api/schema';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mocksEnabled } from '@/lib/mock';
import { isValidPolygon, pointInPolygon } from './geo';
import type { CoverageCheck, CoverageZone, CreateZone, UpdateZone } from './types';

export interface CoverageBackend {
  /** Every zone, newest first: follows `nextCursor` to the end (zones are few; the page lists them on the client). */
  list(token: string, lang: string): Promise<ApiResult<CoverageZone[]>>;
  create(token: string, lang: string, input: CreateZone): Promise<ApiResult<CoverageZone>>;
  update(token: string, lang: string, id: string, input: UpdateZone): Promise<ApiResult<CoverageZone>>;
  remove(token: string, lang: string, id: string): Promise<ApiResult<null>>;
  check(lat: number, lng: number, lang: string): Promise<ApiResult<CoverageCheck>>;
}

const TIMEOUT_MS = 5000;
const MAX_PAGES = 20; // 1000 zones: far beyond any real list, stops a cursor loop

function apiBackend(baseUrl: string): CoverageBackend {
  const api = createClient<paths>({ baseUrl, fetch: (r: Request) => fetch(r, { signal: AbortSignal.timeout(TIMEOUT_MS) }) });
  const headers = (token: string | null, lang: string) => ({ 'Accept-Language': lang, ...(token ? { Authorization: `Bearer ${token}` } : {}) });
  const call = async <T,>(p: Promise<{ data?: T; error?: unknown; response: Response }>, empty = false): Promise<ApiResult<T>> => {
    try {
      const { data, error, response } = await p;
      if (!error && (empty || data !== undefined)) return { ok: true, data: (empty ? null : data) as T, status: response.status };
      const e = error as components['schemas']['ErrorResponseDto'] | undefined;
      return { ok: false, code: e?.code ?? 'NETWORK', status: e?.code ? response.status : 502, details: e?.details };
    } catch {
      return { ok: false, code: 'NETWORK', status: 502 };
    }
  };
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

const store = ((globalThis as { __coverageZones?: Map<string, CoverageZone> }).__coverageZones ??= new Map([
  [
    '6f1c2a3e-1d2b-4c5d-8e9f-0a1b2c3d4e5f',
    {
      id: '6f1c2a3e-1d2b-4c5d-8e9f-0a1b2c3d4e5f',
      name: { ar: 'شمال الرياض', en: 'North Riyadh' },
      city: 'الرياض',
      color: '#6A1A20',
      isActive: true,
      polygon: { type: 'Polygon', coordinates: [[[46.58, 24.74], [46.74, 24.74], [46.74, 24.86], [46.58, 24.86], [46.58, 24.74]]] },
      createdAt: '2026-11-18T10:00:00.000Z',
      updatedAt: '2026-11-18T10:00:00.000Z',
    },
  ],
]));

const invalid = { ok: false, code: 'INVALID_POLYGON', status: 422 } as const;
const notFound = { ok: false, code: 'NOT_FOUND', status: 404 } as const;

/** Mock with the API's rules: newest first, PATCH changes only the fields sent, inactive zones never cover. */
export const mockCoverage: CoverageBackend = {
  async list() {
    return { ok: true, data: [...store.values()].reverse() };
  },
  async create(_t, _l, input) {
    if (!isValidPolygon(input.polygon)) return invalid;
    const now = new Date().toISOString();
    const zone: CoverageZone = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    store.set(zone.id, zone);
    return { ok: true, data: zone, status: 201 };
  },
  async update(_t, _l, id, input) {
    const old = store.get(id);
    if (!old) return notFound;
    if (input.polygon && !isValidPolygon(input.polygon)) return invalid;
    const zone = { ...old, ...input, updatedAt: new Date().toISOString() };
    store.set(id, zone);
    return { ok: true, data: zone };
  },
  async remove(_t, _l, id) {
    return store.delete(id) ? { ok: true, data: null } : notFound;
  },
  async check(lat, lng) {
    const zone = [...store.values()].reverse().find((z) => z.isActive && pointInPolygon([lng, lat], z.polygon));
    return { ok: true, data: zone ? { covered: true, zone: { id: zone.id, name: zone.name, city: zone.city } } : { covered: false, zone: null } };
  },
};

export function coverageBackend(): CoverageBackend {
  return mocksEnabled() ? mockCoverage : apiBackend(process.env.API_URL ?? 'http://localhost:3000');
}
