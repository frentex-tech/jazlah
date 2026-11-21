// The in-process mock of backend.ts (DASHBOARD_API_MOCK=1): loaded only through lib/mock-backends.ts, so a production
// build leaves it out.
import { isValidPolygon, pointInPolygon } from './geo';
import type { CoverageZone } from './types';
import type { CoverageBackend } from './backend';

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
