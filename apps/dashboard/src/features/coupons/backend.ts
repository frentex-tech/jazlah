// Admin coupons (CRT-DSH-1) behind one interface: the API through the generated client (CRT-API-3 `/v1/admin/coupons*`),
// or the in-memory mock with the same shapes (DASHBOARD_API_MOCK=1). Until CRT-API-3 lands the routes answer
// NOT_IMPLEMENTED: the pages show «قريبًا» from that answer.
import { apiCall as call, apiClient, apiHeaders as headers } from '@/api/client';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type { Coupon, CouponInput, CouponPatch, CouponQuery, CouponUsage, Page } from './types';

export interface CouponsBackend {
  list(token: string, lang: string, query: CouponQuery): Promise<ApiResult<Page<Coupon>>>;
  get(token: string, lang: string, id: string): Promise<ApiResult<Coupon>>;
  /** A code already used (any case) answers COUPON_CODE_TAKEN (409). */
  create(token: string, lang: string, body: CouponInput): Promise<ApiResult<Coupon>>;
  /** Only the keys sent change; deactivating sends `{ isActive: false }`. */
  update(token: string, lang: string, id: string, patch: CouponPatch): Promise<ApiResult<Coupon>>;
  usage(token: string, lang: string, id: string): Promise<ApiResult<CouponUsage>>;
}

function apiBackend(): CouponsBackend {
  const api = apiClient();
  const path = (id: string) => ({ path: { id } });
  return {
    list: (token, lang, query) => call(api.GET('/v1/admin/coupons', { params: { query }, headers: headers(token, lang) })),
    get: (token, lang, id) => call(api.GET('/v1/admin/coupons/{id}', { params: path(id), headers: headers(token, lang) })),
    create: (token, lang, body) => call(api.POST('/v1/admin/coupons', { body, headers: headers(token, lang) })),
    update: (token, lang, id, body) => call(api.PATCH('/v1/admin/coupons/{id}', { params: path(id), body, headers: headers(token, lang) })),
    usage: (token, lang, id) => call(api.GET('/v1/admin/coupons/{id}/usage', { params: path(id), headers: headers(token, lang) })),
  };
}

export function couponsBackend(): CouponsBackend {
  return mockBackends()?.coupons ?? apiBackend();
}
