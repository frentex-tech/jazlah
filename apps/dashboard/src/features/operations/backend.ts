// Operations settings (SCH-DSH-1) and per-vendor capacity behind one interface. The endpoints (SCH-API-1
// `GET/PUT /v1/admin/settings/operations`, SCH-API-2 capacity overrides) are not in openapi.json yet: only the in-memory
// mock answers (DASHBOARD_API_MOCK=1); it follows the sprint-3.md shapes, so wiring the API is only `apiBackend`.
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type { DayCapacity, OperationsSettings, VendorCapacity } from './types';

export interface OperationsBackend {
  get(token: string, lang: string): Promise<ApiResult<OperationsSettings>>;
  /** Only the keys sent change; answers the whole settings. */
  update(token: string, lang: string, patch: Partial<OperationsSettings>): Promise<ApiResult<OperationsSettings>>;
  vendorCapacity(token: string, lang: string, vendorId: string): Promise<ApiResult<VendorCapacity>>;
  setVendorDefault(token: string, lang: string, vendorId: string, body: Pick<VendorCapacity, 'ordersPerDay' | 'carcassesPerDay'>): Promise<ApiResult<VendorCapacity>>;
  setDay(token: string, lang: string, vendorId: string, date: string, body: Pick<DayCapacity, 'ordersLimit' | 'carcassesLimit'>): Promise<ApiResult<VendorCapacity>>;
  removeDay(token: string, lang: string, vendorId: string, date: string): Promise<ApiResult<VendorCapacity>>;
}

// shortcut: no operations or capacity endpoints in openapi.json yet, so the API answers as unavailable; replace with the
// generated client once SCH-API-1 / SCH-API-2 merge their contracts (#70).
const unavailable = async () => ({ ok: false, code: 'SERVICE_UNAVAILABLE', status: 503 }) as const;
const apiBackend: OperationsBackend = { get: unavailable, update: unavailable, vendorCapacity: unavailable, setVendorDefault: unavailable, setDay: unavailable, removeDay: unavailable };

export function operationsBackend(): OperationsBackend {
  return mockBackends()?.operations ?? apiBackend;
}
