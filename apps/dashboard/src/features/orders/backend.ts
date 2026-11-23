// Orders for the admin and vendor boards (ORD-DSH-1) behind one interface: the API through the generated client
// (ORD-API-3 `GET /v1/{vendor,admin}/orders`, `…/{id}`; ORD-API-2 `POST …/{id}/transition`), or the in-memory mock with
// the same shapes (DASHBOARD_API_MOCK=1). Until its task lands a route answers NOT_IMPLEMENTED: the page shows «قريبًا»
// from that answer. Admin cancel & refund and reschedule are Sprint 4 routes (not in the contract), so they are optional
// here: the mock has them, the API backend does not.
import { apiCall as call, apiClient, apiHeaders as headers } from '@/api/client';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type { CancelBody, DayOption, Order, OrderQuery, OrderStatus, OrderSummary, Page } from './types';

export type OrdersPanel = 'admin' | 'vendor';

export interface OrdersBackend {
  /** Vendors get their own orders only; `vendorId` filters the admin list. */
  list(token: string, lang: string, panel: OrdersPanel, query: OrderQuery): Promise<ApiResult<Page<OrderSummary>>>;
  get(token: string, lang: string, panel: OrdersPanel, id: string): Promise<ApiResult<Order>>;
  /** `to` is one of the order's `allowedTransitions`; a cancel needs its `note` (a COD reject's reason). */
  transition(token: string, lang: string, panel: OrdersPanel, id: string, body: { to: OrderStatus; note?: string }): Promise<ApiResult<Order>>;
  /** Sprint 4 (CAN-API-1): absent on the API; the page shows the action disabled. */
  cancel?(token: string, lang: string, id: string, body: CancelBody): Promise<ApiResult<Order>>;
  /** Not in any sprint yet: the days a reschedule may pick. */
  rescheduleDays?(token: string, lang: string, id: string): Promise<ApiResult<DayOption[]>>;
  /** Sprint 4 (DLV-API-1). */
  reschedule?(token: string, lang: string, id: string, date: string): Promise<ApiResult<Order>>;
  /**
   * New orders pushed for the caller; returns the unsubscribe. Only the mock pushes: the contract has no realtime for the
   * dashboard yet (orders.md: poll until ORD-API-3's socket), so on the API the board polls (feed.ts).
   */
  watch?(token: string, panel: OrdersPanel, onOrder: (o: OrderSummary) => void): () => void;
}

function apiBackend(): OrdersBackend {
  const api = apiClient();
  const path = (id: string) => ({ path: { id } });
  return {
    list: (token, lang, panel, query) =>
      panel === 'admin'
        ? call(api.GET('/v1/admin/orders', { params: { query }, headers: headers(token, lang) }))
        : call(api.GET('/v1/vendor/orders', { params: { query: { ...query, vendorId: undefined } }, headers: headers(token, lang) })),
    get: (token, lang, panel, id) =>
      call(panel === 'admin' ? api.GET('/v1/admin/orders/{id}', { params: path(id), headers: headers(token, lang) }) : api.GET('/v1/vendor/orders/{id}', { params: path(id), headers: headers(token, lang) })),
    transition: (token, lang, panel, id, body) =>
      call(
        panel === 'admin'
          ? api.POST('/v1/admin/orders/{id}/transition', { params: path(id), body, headers: headers(token, lang) })
          : api.POST('/v1/vendor/orders/{id}/transition', { params: path(id), body, headers: headers(token, lang) }),
      ),
  };
}

export function ordersBackend(): OrdersBackend {
  return mockBackends()?.orders ?? apiBackend();
}

/** Whether the backend has the Sprint 4 admin cancel & refund and reschedule (the mock does). */
export const hasAdminOrderActions = () => !!ordersBackend().cancel;
