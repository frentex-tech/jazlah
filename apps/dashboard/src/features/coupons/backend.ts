// Admin coupons (CRT-DSH-1) behind one interface. The CRT-API-3 endpoints (`/v1/admin/coupons` CRUD + usage) are not in
// openapi.json yet: only the in-memory mock answers (DASHBOARD_API_MOCK=1); it follows the sprint-3.md shapes, so wiring
// the API is only `apiBackend`.
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type { Coupon, CouponInput, CouponQuery, CouponUsage, Page } from './types';

export interface CouponsBackend {
  list(token: string, lang: string, query: CouponQuery): Promise<ApiResult<Page<Coupon>>>;
  get(token: string, lang: string, id: string): Promise<ApiResult<Coupon>>;
  /** A code already used (any case) answers COUPON_CODE_TAKEN (409). */
  create(token: string, lang: string, body: CouponInput): Promise<ApiResult<Coupon>>;
  /** Only the keys sent change; deactivating sends `{ isActive: false }`. */
  update(token: string, lang: string, id: string, patch: Partial<CouponInput>): Promise<ApiResult<Coupon>>;
  usage(token: string, lang: string, id: string): Promise<ApiResult<CouponUsage>>;
}

// shortcut: no coupon endpoints in openapi.json yet, so the API answers as unavailable; replace with the generated
// client once CRT-API-3 merges its contract (#63).
const unavailable = async () => ({ ok: false, code: 'SERVICE_UNAVAILABLE', status: 503 }) as const;
const apiBackend: CouponsBackend = { list: unavailable, get: unavailable, create: unavailable, update: unavailable, usage: unavailable };

export function couponsBackend(): CouponsBackend {
  return mockBackends()?.coupons ?? apiBackend;
}
