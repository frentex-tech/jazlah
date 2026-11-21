// Orders for the admin and vendor boards (ORD-DSH-1) behind one interface. The endpoints (ORD-API-3 `GET /v1/{vendor,admin}/orders`,
// `…/:id`, `POST …/:id/transition`, plus the admin cancel & refund and reschedule) are not in openapi.json yet: only the
// in-memory mock answers (DASHBOARD_API_MOCK=1); it follows the sprint-3.md shapes, so wiring the API is only `apiBackend`.
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type { CancelBody, DayOption, Order, OrderQuery, OrderStatus, OrderSummary, Page } from './types';

export type OrdersPanel = 'admin' | 'vendor';

export interface OrdersBackend {
  /** Vendors get their own orders only; `vendorId` filters the admin list. */
  list(token: string, lang: string, panel: OrdersPanel, query: OrderQuery): Promise<ApiResult<Page<OrderSummary>>>;
  get(token: string, lang: string, panel: OrdersPanel, id: string): Promise<ApiResult<Order>>;
  transition(token: string, lang: string, panel: OrdersPanel, id: string, body: { to: OrderStatus; note?: string }): Promise<ApiResult<Order>>;
  cancel(token: string, lang: string, id: string, body: CancelBody): Promise<ApiResult<Order>>;
  rescheduleDays(token: string, lang: string, id: string): Promise<ApiResult<DayOption[]>>;
  reschedule(token: string, lang: string, id: string, date: string): Promise<ApiResult<Order>>;
  /**
   * Realtime `order.created` for the caller's room (`vendor:{id}` or `admin:orders`); returns the unsubscribe. Absent when
   * the backend has no push: the page then polls the list (feed.ts).
   */
  watch?(token: string, panel: OrdersPanel, onOrder: (o: OrderSummary) => void): () => void;
}

// shortcut: no order endpoints in openapi.json yet, so the API answers as unavailable and the board polls; replace with the
// generated client, and `watch` with ORD-API-3's socket.io rooms, once ORD-API-3 merges its contract (#88).
const unavailable = async () => ({ ok: false, code: 'SERVICE_UNAVAILABLE', status: 503 }) as const;
const apiBackend: OrdersBackend = { list: unavailable, get: unavailable, transition: unavailable, cancel: unavailable, rescheduleDays: unavailable, reschedule: unavailable };

export function ordersBackend(): OrdersBackend {
  return mockBackends()?.orders ?? apiBackend;
}
