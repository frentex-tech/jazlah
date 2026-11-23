// Admin vendor review (VND-DSH-2) behind one interface: the API through the generated client, or an in-memory mock for
// local work and the Playwright smoke tests (DASHBOARD_API_MOCK=1). The mock keeps the API's shapes, error codes and
// rules, and shares its applications with the vendor-application mock: one submitted there is listed here.
import { apiCall as call, apiClient, apiHeaders as headers } from '@/api/client';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
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

export function adminVendorsBackend(): AdminVendorsBackend {
  return mockBackends()?.adminVendors ?? apiBackend();
}
