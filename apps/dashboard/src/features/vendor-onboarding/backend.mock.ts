// The in-process mock of backend.ts (DASHBOARD_API_MOCK=1): loaded only through lib/mock-backends.ts, so a production
// build leaves it out.
import type { ApiResult } from '@/lib/auth/panel-session';
import { REQUIRED_DOCS, type MediaFile, type UploadTicket, type VendorApplication, type VendorProfile } from './types';
import { ibanElectronic } from './validators';
import type { UploadRequest, VendorOnboardingBackend } from './backend';

// Applicants are keyed by their mock access token (lib/auth/backend.ts): «mock-at-customer-<9 digits of the phone>».
// Seeds: 0500000005 has a rejected application (re-apply), 0500000006 an approved one. Any other phone starts empty.
type MockMedia = { purpose: string; contentType: string; fileName: string | null; bytes?: ArrayBuffer };
type MockState = { applications: Map<string, VendorApplication>; media: Map<string, MockMedia>; profile: VendorProfile };
const g = globalThis as { __vendorOnboarding?: MockState };
const SEED_DOCS = ['0f6c1d1e-1a2b-4c3d-8e4f-5a6b7c8d9e01', '0f6c1d1e-1a2b-4c3d-8e4f-5a6b7c8d9e02', '0f6c1d1e-1a2b-4c3d-8e4f-5a6b7c8d9e03'];
const seedApplication = (status: 'rejected' | 'approved', applicant: string): VendorApplication => ({
  id: status === 'rejected' ? '2a41c7d0-5e6f-4a1b-9c2d-3e4f5a6b7c8d' : '3b52d8e1-6f70-4b2c-8d3e-4f5a6b7c8d9e',
  applicantId: applicant,
  status,
  name: { ar: 'ملحمة النخبة', en: 'Al Nokhba Butchery' },
  description: { ar: 'لحوم بلدية طازجة يوميًا', en: null },
  commercialRegistrationNumber: '1010458216',
  vatNumber: null,
  city: 'الرياض',
  ibanMasked: 'SA** **** **** **** **** 7519',
  accountHolderName: 'مؤسسة النخبة للحوم',
  location: { latitude: 24.7136, longitude: 46.6753 },
  documents: [
    { kind: 'commercial_registration', mediaId: SEED_DOCS[0]! },
    { kind: 'health_certificate', mediaId: SEED_DOCS[1]! },
    { kind: 'facility_photo', mediaId: SEED_DOCS[2]! },
  ],
  rejectionReason: status === 'rejected' ? 'صورة الشهادة الصحية غير واضحة، وتاريخ انتهائها لا يظهر. ارفع نسخة سارية وواضحة.' : null,
  reviewedAt: '2026-11-19T11:10:00.000Z',
  createdAt: '2026-11-18T07:24:00.000Z',
});
const state: MockState = (g.__vendorOnboarding ??= {
  applications: new Map([
    ['500000005', seedApplication('rejected', 'mock-applicant-5')],
    ['500000006', seedApplication('approved', 'mock-applicant-6')],
  ]),
  media: new Map(SEED_DOCS.map((id): [string, MockMedia] => [id, { purpose: 'vendor.document', contentType: 'application/pdf', fileName: null, bytes: new ArrayBuffer(1) }])),
  profile: {
    id: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    name: { ar: 'مجازر الفلاح', en: 'Al Falah Butchery' },
    description: { ar: 'مجزر عائلي في الرياض منذ 1998، نذبح يوميًا ونوصّل طازجًا', en: null },
    logoUrl: '/login/admin.jpg',
    coverUrl: '/login/vendor.jpg',
    city: 'الرياض',
    commissionBasisPoints: 1200,
    commercialRegistrationNumber: '1010123456',
    vatNumber: null,
    contactPhone: '+966551234567',
    contactEmail: 'orders@alfalah-meat.sa',
    ibanMasked: 'SA** **** **** **** **** 7519',
    accountHolderName: 'مجازر الفلاح',
    location: { latitude: 24.7136, longitude: 46.6753 },
    createdAt: '2026-11-15T10:00:00.000Z',
  },
});

const applicantOf = (token: string) => token.replace(/^mock-at-customer-?/, '') || 'anonymous';
const invalid = (field: string, constraint: string) =>
  ({ ok: false, code: 'VALIDATION_FAILED', status: 400, details: [{ field, constraints: [constraint] }] }) as const;

function mockTicket(purpose: string, body: UploadRequest): ApiResult<UploadTicket> {
  const id = crypto.randomUUID();
  state.media.set(id, { purpose, contentType: body.contentType, fileName: body.fileName ?? null });
  const now = Date.now();
  return {
    ok: true,
    status: 201,
    data: { mediaId: id, url: '/api/mock-storage', fields: { key: id }, expiresAt: new Date(now + 300_000).toISOString(), confirmBy: new Date(now + 3_600_000).toISOString() },
  };
}

function mockConfirm(id: string): ApiResult<MediaFile> {
  const m = state.media.get(id);
  if (!m) return { ok: false, code: 'MEDIA_NOT_FOUND', status: 404 };
  if (!m.bytes) return { ok: false, code: 'MEDIA_UPLOAD_REJECTED', status: 422, details: { reason: 'OBJECT_MISSING' } };
  return {
    ok: true,
    data: {
      id, purpose: m.purpose, visibility: m.purpose === 'vendor.document' ? 'private' : 'public', status: 'ready', sizeBytes: m.bytes.byteLength,
      contentType: m.contentType, originalFileName: m.fileName, confirmedAt: new Date().toISOString(),
    },
  };
}

/** The mock storage's side (app/api/mock-storage): keeps an uploaded file, and serves public ones back. */
export const mockStorage = {
  put(key: string, bytes: ArrayBuffer): boolean {
    const m = state.media.get(key);
    if (!m) return false;
    m.bytes = bytes;
    return true;
  },
  /** `signed`: an admin's document link (features/admin-vendors), which may serve a private file. */
  get: (key: string, signed = false) => {
    const m = state.media.get(key);
    return m?.bytes && (signed || m.purpose !== 'vendor.document') ? m : null;
  },
};

/** The mock's uploads, shared with the admin catalog mock (features/catalog/backend.ts): same tickets, storage and checks. */
export const mockMedia = {
  ticket: mockTicket,
  confirm: mockConfirm,
  /** A confirmed public file's purpose and URL (mock storage), or null. */
  ready: (id: string) => {
    const m = state.media.get(id);
    return m?.bytes ? { purpose: m.purpose, url: `/api/mock-storage?key=${id}` } : m ? { purpose: m.purpose, url: null } : null;
  },
};

/** The applications of this mock, shared with the admin review mock (features/admin-vendors/backend.ts). */
export const mockApplications = state.applications;

export const mockOnboarding: VendorOnboardingBackend = {
  async latestApplication(token) {
    const a = state.applications.get(applicantOf(token));
    return a ? { ok: true, data: a } : { ok: false, code: 'NOT_FOUND', status: 404 };
  },
  async submitApplication(token, _lang, body) {
    const key = applicantOf(token);
    if (state.applications.get(key)?.status === 'pending') return { ok: false, code: 'VENDOR_APPLICATION_ALREADY_PENDING', status: 409 };
    if (state.applications.get(key)?.status === 'approved') return { ok: false, code: 'VENDOR_ACCESS_ALREADY_HELD', status: 409 };
    for (const d of body.documents) {
      const m = state.media.get(d.mediaId);
      if (!m || m.purpose !== 'vendor.document') return { ok: false, code: 'MEDIA_NOT_FOUND', status: 404, details: { mediaId: d.mediaId } };
    }
    if (!REQUIRED_DOCS.every((k) => body.documents.some((d) => d.kind === k))) return invalid('documents', 'requiresEachDocumentKind');
    const iban = ibanElectronic(body.iban);
    const application: VendorApplication = {
      id: crypto.randomUUID(),
      applicantId: `mock-applicant-${key}`,
      status: 'pending',
      name: body.name,
      description: { ar: body.description?.ar || null, en: body.description?.en || null },
      commercialRegistrationNumber: body.commercialRegistrationNumber,
      vatNumber: body.vatNumber ?? null,
      city: body.city,
      ibanMasked: `SA** **** **** **** **** ${iban.slice(-4)}`,
      accountHolderName: body.accountHolderName,
      location: body.location,
      documents: body.documents,
      rejectionReason: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
    };
    state.applications.set(key, application);
    return { ok: true, data: application, status: 201 };
  },
  async requestDocumentUpload(_t, _l, body) {
    return mockTicket('vendor.document', body);
  },
  async confirmDocumentUpload(_t, _l, id) {
    return mockConfirm(id);
  },
  async profile() {
    return { ok: true, data: state.profile };
  },
  async updateProfile(_t, _l, body) {
    // A way to see the suspended state (131:24863) on the mock: this email answers as a suspended store would.
    if (body.contactEmail === 'suspended@example.com') return { ok: false, code: 'VENDOR_SUSPENDED', status: 403 };
    const p = { ...state.profile, description: { ...state.profile.description } };
    for (const [field, url] of [['logoMediaId', 'logoUrl'], ['coverMediaId', 'coverUrl']] as const) {
      const id = body[field];
      if (id === undefined) continue;
      if (id !== null && state.media.get(id)?.purpose !== (field === 'logoMediaId' ? 'vendor.logo' : 'vendor.cover')) {
        return { ok: false, code: 'MEDIA_NOT_FOUND', status: 404, details: { mediaId: id } };
      }
      p[url] = id === null ? null : `/api/mock-storage?key=${id}`;
    }
    if (body.contactPhone !== undefined) p.contactPhone = body.contactPhone;
    if (body.contactEmail !== undefined) p.contactEmail = body.contactEmail?.trim().toLowerCase() || null;
    if (body.vatNumber !== undefined) p.vatNumber = body.vatNumber;
    if (body.description) {
      for (const l of ['ar', 'en'] as const) if (body.description[l] !== undefined) p.description[l] = body.description[l]?.trim() || null;
    }
    state.profile = p;
    return { ok: true, data: p };
  },
  async requestImageUpload(_t, _l, body) {
    return mockTicket(body.purpose, body);
  },
  async confirmImageUpload(_t, _l, id) {
    return mockConfirm(id);
  },
};
