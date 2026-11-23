// Operations settings (SCH-DSH-1) and per-vendor capacity behind one interface: the API through the generated client
// (SCH-API-1 `/v1/admin/settings/operations*`, SCH-API-2 `/v1/admin/vendors/{id}/capacity*`), or the in-memory mock
// with the same shapes (DASHBOARD_API_MOCK=1). Until its task lands a route answers NOT_IMPLEMENTED: the page shows
// «قريبًا» from that answer, so it works as soon as the route does.
import { apiCall as call, apiClient, apiHeaders as headers } from '@/api/client';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type { DayLimit, OperationsPatch, OperationsSettings, Paused, SetPause, VendorCapacity, VendorDefault } from './types';

export interface OperationsBackend {
  /** The ordering pause from the public client settings: any admin may read it (the header switch and banner). */
  pause(lang: string): Promise<ApiResult<Paused>>;
  get(token: string, lang: string): Promise<ApiResult<OperationsSettings>>;
  /** Only the keys sent change; answers the whole settings. */
  update(token: string, lang: string, patch: OperationsPatch): Promise<ApiResult<OperationsSettings>>;
  /** The ordering pause on its own route (header switch, the page's pause card), so a page save never resumes. */
  setPause(token: string, lang: string, pause: SetPause): Promise<ApiResult<OperationsSettings>>;
  vendorCapacity(token: string, lang: string, vendorId: string): Promise<ApiResult<VendorCapacity>>;
  setVendorDefault(token: string, lang: string, vendorId: string, body: VendorDefault): Promise<ApiResult<VendorCapacity>>;
  setDay(token: string, lang: string, vendorId: string, date: string, body: DayLimit): Promise<ApiResult<VendorCapacity>>;
  removeDay(token: string, lang: string, vendorId: string, date: string): Promise<ApiResult<VendorCapacity>>;
}

function apiBackend(): OperationsBackend {
  const api = apiClient();
  const day = (id: string, date: string) => ({ path: { id, date } });
  return {
    pause: async (lang) => {
      const r = await call(api.GET('/v1/public/settings/client', { headers: headers(null, lang) }));
      return r.ok ? { ok: true, data: r.data.paused } : r;
    },
    get: (token, lang) => call(api.GET('/v1/admin/settings/operations', { headers: headers(token, lang) })),
    update: (token, lang, body) => call(api.PATCH('/v1/admin/settings/operations', { body, headers: headers(token, lang) })),
    setPause: (token, lang, body) => call(api.PUT('/v1/admin/settings/operations/pause', { body, headers: headers(token, lang) })),
    vendorCapacity: (token, lang, id) => call(api.GET('/v1/admin/vendors/{id}/capacity', { params: { path: { id } }, headers: headers(token, lang) })),
    setVendorDefault: (token, lang, id, body) => call(api.PUT('/v1/admin/vendors/{id}/capacity', { params: { path: { id } }, body, headers: headers(token, lang) })),
    setDay: (token, lang, id, date, body) => call(api.PUT('/v1/admin/vendors/{id}/capacity/{date}', { params: day(id, date), body, headers: headers(token, lang) })),
    removeDay: (token, lang, id, date) => call(api.DELETE('/v1/admin/vendors/{id}/capacity/{date}', { params: day(id, date), headers: headers(token, lang) })),
  };
}

export function operationsBackend(): OperationsBackend {
  return mockBackends()?.operations ?? apiBackend();
}
