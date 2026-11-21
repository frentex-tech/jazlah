// Vendor application (customer session), store profile and media uploads (vendor session) behind one interface: the
// API through the generated client, or an in-memory mock for local work and the Playwright smoke tests
// (DASHBOARD_API_MOCK=1). The mock keeps the API's shapes, error codes and rules.
import { apiCall as call, apiClient, apiHeaders as headers } from '@/api/client';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type {
  MediaFile, SubmitApplication, UpdateProfile, UploadTicket, VendorApplication, VendorProfile, VendorUploadPurpose,
} from './types';

export type UploadRequest = { contentType: string; fileName?: string };

export interface VendorOnboardingBackend {
  latestApplication(token: string, lang: string): Promise<ApiResult<VendorApplication>>;
  submitApplication(token: string, lang: string, body: SubmitApplication): Promise<ApiResult<VendorApplication>>;
  /** Customer upload, always purpose vendor.document. */
  requestDocumentUpload(token: string, lang: string, body: UploadRequest): Promise<ApiResult<UploadTicket>>;
  confirmDocumentUpload(token: string, lang: string, id: string): Promise<ApiResult<MediaFile>>;
  profile(token: string, lang: string): Promise<ApiResult<VendorProfile>>;
  updateProfile(token: string, lang: string, body: UpdateProfile): Promise<ApiResult<VendorProfile>>;
  requestImageUpload(token: string, lang: string, body: UploadRequest & { purpose: VendorUploadPurpose }): Promise<ApiResult<UploadTicket>>;
  confirmImageUpload(token: string, lang: string, id: string): Promise<ApiResult<MediaFile>>;
}

function apiBackend(): VendorOnboardingBackend {
  const api = apiClient();
  return {
    latestApplication: (token, lang) => call(api.GET('/v1/customer/vendor-applications/latest', { headers: headers(token, lang) })),
    submitApplication: (token, lang, body) => call(api.POST('/v1/customer/vendor-applications', { body, headers: headers(token, lang) })),
    requestDocumentUpload: (token, lang, body) =>
      call(api.POST('/v1/customer/media/uploads', { body: { ...body, purpose: 'vendor.document' }, headers: headers(token, lang) })),
    confirmDocumentUpload: (token, lang, id) =>
      call(api.POST('/v1/customer/media/{id}/confirm', { params: { path: { id } }, headers: headers(token, lang) })),
    profile: (token, lang) => call(api.GET('/v1/vendor/profile', { headers: headers(token, lang) })),
    updateProfile: (token, lang, body) => call(api.PATCH('/v1/vendor/profile', { body, headers: headers(token, lang) })),
    requestImageUpload: (token, lang, body) => call(api.POST('/v1/vendor/media/uploads', { body, headers: headers(token, lang) })),
    confirmImageUpload: (token, lang, id) =>
      call(api.POST('/v1/vendor/media/{id}/confirm', { params: { path: { id } }, headers: headers(token, lang) })),
  };
}

export function onboardingBackend(): VendorOnboardingBackend {
  return mockBackends()?.onboarding ?? apiBackend();
}
