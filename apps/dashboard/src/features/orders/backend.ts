// Orders for the admin and vendor boards (ORD-DSH-1) behind one interface. The endpoints (ORD-API-3 `GET /v1/{vendor,admin}/orders`,
// `…/:id`, `POST …/:id/transition`) are not in openapi.json yet: only the in-memory mock answers (DASHBOARD_API_MOCK=1); it
// follows the sprint-3.md shapes, so wiring the API is only `apiBackend`. Admin cancel & refund and reschedule are Sprint 4
// routes (CAN-API-1, DLV-API-1), so they are optional here: the mock has them, the Sprint 3 API does not.
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type { CancelBody, DayOption, Order, OrderQuery, OrderStatus, OrderSummary, Page } from './types';

export type OrdersPanel = 'admin' | 'vendor';

export interface OrdersBackend {
  /** Vendors get their own orders only; `vendorId` filters the admin list. */
  list(token: string, lang: string, panel: OrdersPanel, query: OrderQuery): Promise<ApiResult<Page<OrderSummary>>>;
  get(token: string, lang: string, panel: OrdersPanel, id: string): Promise<ApiResult<Order>>;
  transition(token: string, lang: string, panel: OrdersPanel, id: string, body: { to: OrderStatus; note?: string }): Promise<ApiResult<Order>>;
  /** Sprint 4 (CAN-API-1 `POST /v1/admin/orders/:id/cancel`): absent on the Sprint 3 API; the page shows the action disabled. */
  cancel?(token: string, lang: string, id: string, body: CancelBody): Promise<ApiResult<Order>>;
  /** Not in any sprint yet: the days a reschedule may pick (SCH-API-2's `availableDays` for this order). */
  rescheduleDays?(token: string, lang: string, id: string): Promise<ApiResult<DayOption[]>>;
  /** Sprint 4 (DLV-API-1 `POST /v1/admin/orders/:id/reschedule {date}`). */
  reschedule?(token: string, lang: string, id: string, date: string): Promise<ApiResult<Order>>;
  /**
   * Realtime `order.created` for the caller's room (`vendor:{id}` or `admin:orders`); returns the unsubscribe. Absent when
   * the backend has no push: the page then polls the list (feed.ts).
   */
  watch?(token: string, panel: OrdersPanel, onOrder: (o: OrderSummary) => void): () => void;
}

// shortcut: no order endpoints in openapi.json yet, so the API answers as unavailable and the board polls; replace with the
// generated client, and `watch` with ORD-API-3's socket.io rooms, once ORD-API-3 merges its contract (#88). Cancel & refund
// and reschedule stay off the API backend until their Sprint 4 routes exist; COD reject uses `transition` to `cancelled`.
const unavailable = async () => ({ ok: false, code: 'SERVICE_UNAVAILABLE', status: 503 }) as const;
const apiBackend: OrdersBackend = { list: unavailable, get: unavailable, transition: unavailable };

export function ordersBackend(): OrdersBackend {
  return mockBackends()?.orders ?? apiBackend;
}

/** Whether the backend has the Sprint 4 admin cancel & refund and reschedule (the mock does). */
export const hasAdminOrderActions = () => !!ordersBackend().cancel;
