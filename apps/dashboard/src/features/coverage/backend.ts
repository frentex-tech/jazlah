// Coverage zones behind one interface. The API endpoints (LOC-API-1, #24) are not built yet, so only the mock works;
// it keeps the zones in server memory (DASHBOARD_API_MOCK=1). Swap `notBuilt` for openapi-fetch calls when they land.
import { isValidPolygon, pointInPolygon } from './geo';
import type { CoverageCheck, CoverageZone, ZoneInput } from './types';

export type Result<T> = { ok: true; data: T } | { ok: false; code: 'INVALID_POLYGON' | 'NOT_FOUND' | 'NOT_BUILT'; status: number };

/** The admin's access token, sent as Bearer to /v1/admin/coverage-zones; the API does the real permission check. */
export type AdminAuth = { accessToken: string };

export interface CoverageBackend {
  list(auth: AdminAuth): Promise<Result<CoverageZone[]>>;
  create(auth: AdminAuth, input: ZoneInput): Promise<Result<CoverageZone>>;
  update(auth: AdminAuth, id: string, input: ZoneInput): Promise<Result<CoverageZone>>;
  remove(auth: AdminAuth, id: string): Promise<Result<null>>;
  check(lat: number, lng: number, lang: string): Promise<Result<CoverageCheck>>;
}

const store = ((globalThis as { __coverageZones?: Map<string, CoverageZone> }).__coverageZones ??= new Map([
  [
    '6f1c2a3e-1d2b-4c5d-8e9f-0a1b2c3d4e5f',
    {
      id: '6f1c2a3e-1d2b-4c5d-8e9f-0a1b2c3d4e5f',
      nameAr: 'شمال الرياض',
      nameEn: 'North Riyadh',
      city: 'riyadh',
      color: '#8E1F26',
      isActive: true,
      polygon: { type: 'Polygon', coordinates: [[[46.58, 24.74], [46.74, 24.74], [46.74, 24.86], [46.58, 24.86], [46.58, 24.74]]] },
    },
  ],
]));

const invalid = { ok: false, code: 'INVALID_POLYGON', status: 422 } as const;
const notFound = { ok: false, code: 'NOT_FOUND', status: 404 } as const;

export const mockCoverage: CoverageBackend = {
  async list() {
    return { ok: true, data: [...store.values()] };
  },
  async create(_auth, input) {
    if (!isValidPolygon(input.polygon)) return invalid;
    const zone = { ...input, id: crypto.randomUUID() };
    store.set(zone.id, zone);
    return { ok: true, data: zone };
  },
  async update(_auth, id, input) {
    if (!store.has(id)) return notFound;
    if (!isValidPolygon(input.polygon)) return invalid;
    const zone = { ...input, id };
    store.set(id, zone);
    return { ok: true, data: zone };
  },
  async remove(_auth, id) {
    return store.delete(id) ? { ok: true, data: null } : notFound;
  },
  async check(lat, lng, lang) {
    // Same rule as the API: the first active zone that contains the point.
    const zone = [...store.values()].find((z) => z.isActive && pointInPolygon([lng, lat], z.polygon));
    return { ok: true, data: zone ? { covered: true, zone: { id: zone.id, name: lang === 'en' ? zone.nameEn : zone.nameAr, city: zone.city } } : { covered: false } };
  },
};

const notBuilt = async () => ({ ok: false, code: 'NOT_BUILT', status: 501 }) as const;
const notBuiltBackend: CoverageBackend = { list: notBuilt, create: notBuilt, update: notBuilt, remove: notBuilt, check: notBuilt };

export function coverageBackend(): CoverageBackend {
  return process.env.DASHBOARD_API_MOCK === '1' ? mockCoverage : notBuiltBackend;
}
