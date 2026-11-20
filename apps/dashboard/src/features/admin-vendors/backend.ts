// Admin vendor review (VND-DSH-2) behind one interface: the API through the generated client, or an in-memory mock for
// local work and the Playwright smoke tests (DASHBOARD_API_MOCK=1). The mock keeps the API's shapes, error codes and
// rules, and shares its applications with the vendor-application mock: one submitted there is listed here.
import { apiCall as call, apiClient, apiHeaders as headers } from '@/api/client';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mocksEnabled } from '@/lib/mock';
import { mockApplications } from '@/features/vendor-onboarding/backend';
import type { Application, ApplicationDetail, ApplicationQuery, Page, Review, Vendor, VendorQuery } from './types';

export interface AdminVendorsBackend {
  listApplications(token: string, lang: string, query: ApplicationQuery): Promise<ApiResult<Page<Application>>>;
  application(token: string, lang: string, id: string): Promise<ApiResult<ApplicationDetail>>;
  approve(token: string, lang: string, id: string, commissionBasisPoints: number): Promise<ApiResult<Vendor>>;
  reject(token: string, lang: string, id: string, reason: string): Promise<ApiResult<Application>>;
  listVendors(token: string, lang: string, query: VendorQuery): Promise<ApiResult<Page<Vendor>>>;
  vendor(token: string, lang: string, id: string): Promise<ApiResult<Vendor>>;
  suspend(token: string, lang: string, id: string, reason: string): Promise<ApiResult<Vendor>>;
  reinstate(token: string, lang: string, id: string): Promise<ApiResult<Vendor>>;
}

function apiBackend(): AdminVendorsBackend {
  const api = apiClient();
  const path = (id: string) => ({ path: { id } });
  return {
    listApplications: (token, lang, query) => call(api.GET('/v1/admin/vendor-applications', { params: { query }, headers: headers(token, lang) })),
    application: (token, lang, id) => call(api.GET('/v1/admin/vendor-applications/{id}', { params: path(id), headers: headers(token, lang) })),
    approve: (token, lang, id, commissionBasisPoints) =>
      call(api.POST('/v1/admin/vendor-applications/{id}/approve', { params: path(id), body: { commissionBasisPoints }, headers: headers(token, lang) })),
    reject: (token, lang, id, reason) =>
      call(api.POST('/v1/admin/vendor-applications/{id}/reject', { params: path(id), body: { reason }, headers: headers(token, lang) })),
    listVendors: (token, lang, query) => call(api.GET('/v1/admin/vendors', { params: { query }, headers: headers(token, lang) })),
    vendor: (token, lang, id) => call(api.GET('/v1/admin/vendors/{id}', { params: path(id), headers: headers(token, lang) })),
    suspend: (token, lang, id, reason) =>
      call(api.POST('/v1/admin/vendors/{id}/suspend', { params: path(id), body: { reason }, headers: headers(token, lang) })),
    reinstate: (token, lang, id) => call(api.POST('/v1/admin/vendors/{id}/reinstate', { params: path(id), headers: headers(token, lang) })),
  };
}

/**
 * The review screen's data from one id, an application's or a vendor's (the list links both): the vendor and the
 * application it came from, or the application alone while it has no vendor.
 */
export async function loadReview(b: AdminVendorsBackend, token: string, lang: string, id: string): Promise<ApiResult<Review>> {
  const v = await b.vendor(token, lang, id);
  if (v.ok) {
    const a = v.data.applicationId ? await b.application(token, lang, v.data.applicationId) : null;
    if (a && !a.ok && a.code !== 'NOT_FOUND') return a;
    return { ok: true, data: { vendor: v.data, application: a?.ok ? a.data : null } };
  }
  if (v.code !== 'NOT_FOUND') return v;
  const a = await b.application(token, lang, id);
  return a.ok ? { ok: true, data: { vendor: null, application: a.data } } : a;
}

// ---- Mock ----
// Seeds follow the rows of 131:16744. An admin whose mock access token ends in «-limited» is answered NOT_ALLOWED, to
// show the not-allowed states (131:17922, 131:18972). The API's FORBIDDEN ends the session (errors.md); the real
// per-permission refusal arrives with ADM-API-1 (#111).
const ADMIN_ID = '9a1b2c3d-4e5f-4a6b-8c7d-0e1f2a3b4c5d';
const PHOTO = ['/login/vendor.jpg', '/login/admin.jpg'];
type Seed = { key: string; status: Application['status']; ar: string; en: string; city: string; cr: string; created: string; holder: string; lat: number; lng: number };
const SEEDS: Seed[] = [
  { key: 'seed-falah', status: 'approved', ar: 'مجازر الفلاح', en: 'Al Falah Butchery', city: 'الرياض', cr: '1010123456', created: '2026-10-10T08:00:00.000Z', holder: 'مجازر الفلاح', lat: 24.7136, lng: 46.6753 },
  { key: 'seed-nokhba', status: 'pending', ar: 'ملحمة النخبة', en: 'Al Nokhba Butchery', city: 'جدة', cr: '4030521187', created: '2026-11-09T09:30:00.000Z', holder: 'فهد القحطاني', lat: 21.5433, lng: 39.1728 },
  { key: 'seed-waha', status: 'pending', ar: 'مزارع الواحة', en: 'Al Waha Farms', city: 'الأحساء', cr: '2250613478', created: '2026-11-07T12:10:00.000Z', holder: 'مؤسسة الواحة', lat: 25.3833, lng: 49.5867 },
  { key: 'seed-riyadh', status: 'approved', ar: 'ذبائح الرياض', en: 'Riyadh Carcasses', city: 'الرياض', cr: '1010987654', created: '2026-09-26T10:00:00.000Z', holder: 'ذبائح الرياض', lat: 24.774, lng: 46.738 },
  { key: 'seed-rai', status: 'approved', ar: 'أسواق الراعي', en: 'Al Rai Markets', city: 'الدمام', cr: '2050114477', created: '2026-08-01T10:00:00.000Z', holder: 'أسواق الراعي', lat: 26.4207, lng: 50.0888 },
];
const seedId = (n: number, kind: 'a' | 'u' | 'd') => `${{ a: '5a', u: '4f', d: '7c' }[kind]}000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const seedUrls = new Map<string, string>();
function seedApplication(s: Seed, i: number): Application {
  const kinds = ['commercial_registration', 'municipality_licence', 'health_certificate', 'national_id', 'facility_photo', 'facility_photo', 'facility_photo'] as const;
  const documents = kinds.map((kind, j) => {
    const mediaId = seedId(i * 10 + j, 'd');
    seedUrls.set(mediaId, PHOTO[j % 2]!);
    return { kind, mediaId };
  });
  return {
    id: seedId(i, 'a'), applicantId: seedId(i, 'u'), status: s.status, name: { ar: s.ar, en: s.en },
    description: { ar: null, en: null }, commercialRegistrationNumber: s.cr, vatNumber: i === 1 ? '300198765400003' : null, city: s.city,
    ibanMasked: `SA** **** **** **** **** ${1234 + i}`, accountHolderName: s.holder, location: { latitude: s.lat, longitude: s.lng }, documents,
    rejectionReason: null, reviewedAt: s.status === 'pending' ? null : new Date(Date.parse(s.created) + 172_800_000).toISOString(), createdAt: s.created,
  };
}

/** JAZLA's own vendor (isPlatform), listed with the others as the API does; the catalog mock sells its products. */
export const MOCK_PLATFORM: Vendor = {
  id: '9e000000-0000-4000-8000-000000000001', name: { ar: 'جزلة', en: 'JAZLA' }, description: { ar: null, en: null }, logoUrl: null, coverUrl: null, city: 'الرياض', commissionBasisPoints: 0,
  commercialRegistrationNumber: null, vatNumber: null, contactPhone: null, contactEmail: null, ibanMasked: null, accountHolderName: null, location: null,
  createdAt: '2026-08-01T08:00:00.000Z', isPlatform: true, status: 'active', suspendedAt: null, suspensionReason: null, applicationId: null,
};

type MockState = { vendors: Map<string, Vendor> };
const g = globalThis as { __adminVendors?: MockState };
const mock: MockState = (g.__adminVendors ??= (() => {
  const vendors = new Map<string, Vendor>();
  const commission = [800, 0, 0, 750, 900];
  SEEDS.forEach((s, i) => {
    const a = seedApplication(s, i);
    mockApplications.set(s.key, a);
    if (s.status !== 'approved') return;
    const v = vendorFrom(a, commission[i]!, a.reviewedAt!);
    if (s.key === 'seed-rai') Object.assign(v, { status: 'suspended', suspendedAt: '2026-11-01T09:00:00.000Z', suspensionReason: 'تكرار شكاوى جودة التغليف خلال أكتوبر' });
    vendors.set(v.id, v);
  });
  vendors.set(MOCK_PLATFORM.id, MOCK_PLATFORM);
  return { vendors };
})());
/** The vendors of this mock, shared with the admin catalog mock (features/catalog/backend.ts), which adds JAZLA's own. */
export const mockVendors = mock.vendors;

// The seed links live outside the global state; rebuild them after a dev reload.
if (seedUrls.size === 0) SEEDS.forEach((s, i) => seedApplication(s, i));

function vendorFrom(a: Application, commissionBasisPoints: number, createdAt: string): Vendor {
  return {
    id: crypto.randomUUID(), name: a.name, description: a.description, logoUrl: null, coverUrl: null, city: a.city, commissionBasisPoints,
    commercialRegistrationNumber: a.commercialRegistrationNumber, vatNumber: a.vatNumber, contactPhone: null, contactEmail: null,
    ibanMasked: a.ibanMasked, accountHolderName: a.accountHolderName, location: a.location, createdAt, isPlatform: false, status: 'active',
    suspendedAt: null, suspensionReason: null, applicationId: a.id,
  };
}

const notFound = { ok: false, code: 'NOT_FOUND', status: 404 } as const;
const forbidden = { ok: false, code: 'NOT_ALLOWED', status: 403 } as const;
const invalid = (field: string, constraint: string) => ({ ok: false, code: 'VALIDATION_FAILED', status: 400, details: [{ field, constraints: [constraint] }] }) as const;
const limited = (token: string) => token.endsWith('-limited');
const entry = (id: string) => [...mockApplications].find(([, a]) => a.id === id);
const matches = (x: { name: { ar: string; en: string }; commercialRegistrationNumber: string | null }, q?: string) =>
  !q || [x.name.ar, x.name.en.toLowerCase(), x.commercialRegistrationNumber ?? ''].some((v) => v.includes(q.trim().toLowerCase()));

/** Newest first, cursor = the offset as the API would write it (opaque to the page), limit 1..50 (default 20). */
function page<T extends { createdAt: string }>(items: T[], cursor?: string, limit = 20): ApiResult<Page<T>> {
  const from = cursor === undefined ? 0 : Number(Buffer.from(cursor, 'base64url').toString());
  if (!Number.isInteger(from) || from < 0) return invalid('cursor', 'isCursor');
  if (limit < 1 || limit > 50) return invalid('limit', 'max');
  const sorted = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const next = from + limit < sorted.length ? Buffer.from(String(from + limit)).toString('base64url') : null;
  return { ok: true, data: { items: sorted.slice(from, from + limit), nextCursor: next } };
}

export const mockAdminVendors: AdminVendorsBackend = {
  async listApplications(token, _l, { status, q, cursor, limit }) {
    if (limited(token)) return forbidden;
    return page([...mockApplications.values()].filter((a) => (!status || a.status === status) && matches(a, q)), cursor, limit);
  },
  async application(token, _l, id) {
    if (limited(token)) return forbidden;
    const a = entry(id)?.[1];
    if (!a) return notFound;
    const expiresAt = new Date(Date.now() + 300_000).toISOString();
    const documents = a.documents.map((d) => ({
      ...d,
      url: seedUrls.get(d.mediaId) ?? `/api/mock-storage?key=${d.mediaId}&expires=${Date.parse(expiresAt)}`,
      expiresAt,
    }));
    return { ok: true, data: { ...a, documents, reviewedById: a.status === 'pending' ? null : ADMIN_ID } };
  },
  async approve(token, _l, id, bps) {
    if (limited(token)) return forbidden;
    if (!Number.isInteger(bps) || bps < 0 || bps > 10000) return invalid('commissionBasisPoints', 'isInt');
    const e = entry(id);
    if (!e) return notFound;
    if (e[1].status !== 'pending') return { ok: false, code: 'VENDOR_APPLICATION_NOT_PENDING', status: 409 };
    const now = new Date().toISOString();
    mockApplications.set(e[0], { ...e[1], status: 'approved', reviewedAt: now });
    const v = vendorFrom(e[1], bps, now);
    mock.vendors.set(v.id, v);
    return { ok: true, data: v };
  },
  async reject(token, _l, id, reason) {
    if (limited(token)) return forbidden;
    const e = entry(id);
    if (!e) return notFound;
    if (e[1].status !== 'pending') return { ok: false, code: 'VENDOR_APPLICATION_NOT_PENDING', status: 409 };
    const a: Application = { ...e[1], status: 'rejected', rejectionReason: reason.trim(), reviewedAt: new Date().toISOString() };
    mockApplications.set(e[0], a);
    return { ok: true, data: a };
  },
  async listVendors(token, _l, { status, q, city, cursor, limit }) {
    if (limited(token)) return forbidden;
    return page([...mock.vendors.values()].filter((v) => (!status || v.status === status) && (!city || v.city === city.trim()) && matches(v, q)), cursor, limit);
  },
  async vendor(token, _l, id) {
    if (limited(token)) return forbidden;
    const v = mock.vendors.get(id);
    return v ? { ok: true, data: v } : notFound;
  },
  async suspend(token, _l, id, reason) {
    if (limited(token)) return forbidden;
    const v = mock.vendors.get(id);
    if (!v) return notFound;
    if (v.status === 'suspended') return { ok: false, code: 'CONFLICT', status: 409, details: { reason: 'VENDOR_ALREADY_SUSPENDED' } };
    const next: Vendor = { ...v, status: 'suspended', suspendedAt: new Date().toISOString(), suspensionReason: reason.trim() };
    mock.vendors.set(id, next);
    return { ok: true, data: next };
  },
  async reinstate(token, _l, id) {
    if (limited(token)) return forbidden;
    const v = mock.vendors.get(id);
    if (!v) return notFound;
    if (v.status === 'active') return { ok: false, code: 'CONFLICT', status: 409, details: { reason: 'VENDOR_NOT_SUSPENDED' } };
    const next: Vendor = { ...v, status: 'active', suspendedAt: null, suspensionReason: null };
    mock.vendors.set(id, next);
    return { ok: true, data: next };
  },
};

export function adminVendorsBackend(): AdminVendorsBackend {
  return mocksEnabled() ? mockAdminVendors : apiBackend();
}
