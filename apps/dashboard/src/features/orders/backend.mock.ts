// The in-process mock of backend.ts (DASHBOARD_API_MOCK=1): loaded only through lib/mock-backends.ts, so a production
// build leaves it out. Seeds follow the rows of 135:47501 and the detail of 135:49134. The vendor session is «مجازر الفلاح»
// (as the vendor products mock). An access token ending in «-limited» (admin or vendor) is answered NOT_ALLOWED
// (135:48887, 135:50278). New orders are pushed to `watch` listeners, like ORD-API-3's `order.created`.
import { mockVendors } from '@/features/admin-vendors/backend.mock';
import { mockOperations } from '@/features/operations/backend.mock';
import type { ApiResult } from '@/lib/auth/panel-session';
import { addDays, riyadhToday } from '@/lib/date';
import type { OrdersBackend, OrdersPanel } from './backend';
import { canReschedule, canTransition } from './state-machine';
import type { DayOption, Name, Order, OrderItem, OrderStatus, OrderSummary, PaymentMethod } from './types';

const vendorByEn = (en: string) => [...mockVendors.values()].find((v) => v.name.en === en)!;
const myVendor = () => vendorByEn('Al Falah Butchery');
const IMG = ['/login/vendor.jpg', '/login/admin.jpg'];

const n = (ar: string, en: string): Name => ({ ar, en });
function item(name: Name, unit: number, quantity: number, i: number, opts: Partial<OrderItem> = {}): OrderItem {
  return {
    id: crypto.randomUUID(), productId: crypto.randomUUID(), name, imageUrl: IMG[i % 2]!, size: null, cut: null, packaging: null, exclusions: [],
    quantity, unitPriceHalalas: unit, totalHalalas: unit * quantity, ...opts,
  };
}
const ribeye = (q = 2) =>
  item(n('ريب آي بقري طازج 500 جم', 'Fresh beef ribeye 500 g'), 8900, q, 0, {
    size: { name: n('500 جم', '500 g'), weightGrams: 500 }, cut: n('ستيك', 'Steak'), packaging: n('كيس فاكيوم', 'Vacuum bag'), exclusions: [n('الدهن', 'Fat')],
  });
const lamb = () => item(n('فخذ ضأن نعيمي', 'Naimi lamb leg'), 5200, 1, 1, { size: { name: n('كيلو', '1 kg'), weightGrams: 1000 }, cut: n('مكعبات', 'Cubes') });
const strips = () => item(n('ستربس بقري شرائح', 'Beef strips'), 1500, 1, 2, { size: { name: n('250 جم', '250 g'), weightGrams: 250 }, packaging: n('صحن مبرد', 'Chilled tray') });

type Seed = { no: number; customer: string; phone: string; vendor: string; status: OrderStatus; method: PaymentMethod; total: number; at: string; pickup?: boolean; items?: OrderItem[] };
// The rows of 135:47501 (newest first), plus a COD order waiting for review and a pickup order, both «مجازر الفلاح».
const SEEDS: Seed[] = [
  { no: 483, customer: 'عبدالله الزهراني', phone: '+966 55 777 1290', vendor: 'Al Falah Butchery', status: 'new', method: 'cod', total: 17800, at: '2026-11-10T09:40:00.000Z', items: [ribeye()] },
  { no: 482, customer: 'سعد العتيبي', phone: '+966 55 123 4567', vendor: 'Al Falah Butchery', status: 'preparing', method: 'mada', total: 24500, at: '2026-11-10T07:02:00.000Z', items: [ribeye(), lamb(), strips()] },
  { no: 481, customer: 'نورة القحطاني', phone: '+966 50 222 8811', vendor: 'Riyadh Carcasses', status: 'delivered', method: 'applepay', total: 118000, at: '2026-11-10T06:20:00.000Z' },
  { no: 480, customer: 'فهد الدوسري', phone: '+966 54 310 9922', vendor: 'Al Falah Butchery', status: 'out_for_delivery', method: 'cod', total: 8900, at: '2026-11-09T12:10:00.000Z' },
  { no: 479, customer: 'منيرة الشمري', phone: '+966 56 880 4410', vendor: 'Al Rai Markets', status: 'cancelled', method: 'mada', total: 43000, at: '2026-11-09T10:00:00.000Z' },
  { no: 478, customer: 'محمد الشهري', phone: '+966 53 645 1200', vendor: 'Riyadh Carcasses', status: 'confirmed', method: 'applepay', total: 31250, at: '2026-11-09T08:30:00.000Z' },
  { no: 477, customer: 'ريم الحربي', phone: '+966 55 901 3374', vendor: 'Al Falah Butchery', status: 'delivered', method: 'card', total: 64500, at: '2026-11-08T11:45:00.000Z' },
  { no: 476, customer: 'خالد المطيري', phone: '+966 50 414 7781', vendor: 'Al Rai Markets', status: 'preparing', method: 'cod', total: 19800, at: '2026-11-08T07:15:00.000Z' },
  { no: 475, customer: 'هند السبيعي', phone: '+966 59 120 6655', vendor: 'Al Falah Butchery', status: 'ready', method: 'wallet', total: 5200, at: '2026-11-08T06:00:00.000Z', pickup: true, items: [lamb()] },
];

// The path each status took from `confirmed`, for the history of the seeds (one step every 15 minutes).
const PATH: OrderStatus[] = ['confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered'];
function historyOf(status: OrderStatus, at: string, method: PaymentMethod, pickup: boolean): Order['history'] {
  const t = (i: number) => new Date(Date.parse(at) + i * 13 * 60_000).toISOString();
  const first = method === 'cod' || method === 'wallet' ? 'new' : 'pending_payment';
  const h: Order['history'] = [{ from: null, to: first, actorType: 'customer', note: null, at: t(0) }];
  if (status === 'new') return h;
  if (status === 'cancelled') return [...h, { from: first, to: 'cancelled', actorType: 'admin', note: null, at: t(1) }];
  const path = pickup ? ['confirmed', 'preparing', 'ready', 'collected'] : PATH;
  const end = path.indexOf(status);
  let from: OrderStatus = first;
  path.slice(0, end + 1).forEach((to, i) => {
    h.push({ from, to: to as OrderStatus, actorType: i === 0 ? (first === 'new' ? 'admin' : 'system') : i < 3 ? 'vendor' : 'delivery', note: null, at: t(i + 1) });
    from = to as OrderStatus;
  });
  return h;
}

const numberOf = (createdAt: string, no: number) => `JZ-${riyadhToday(new Date(createdAt)).slice(2).replace(/-/g, '')}-${String(no).padStart(4, '0')}`;
const OPEN: OrderStatus[] = ['pending_payment', 'new', 'confirmed', 'preparing', 'ready'];

function build(s: Seed): Order {
  const v = vendorByEn(s.vendor);
  const pickup = !!s.pickup;
  const items = s.items ?? [item(n('ذبيحة نعيمي كاملة', 'Whole Naimi carcass'), s.total, 1, s.no)];
  const subtotal = items.reduce((a, i) => a + i.totalHalalas, 0);
  const deliveryFee = pickup ? 0 : s.total - subtotal;
  const paid = s.method !== 'cod' || s.status === 'delivered';
  return {
    id: crypto.randomUUID(), number: numberOf(s.at, s.no), status: s.status, orderType: 'ready_meat', fulfilment: pickup ? 'pickup' : 'delivery',
    vendor: { id: v.id, name: v.name, city: v.city }, customer: { id: crypto.randomUUID(), name: s.customer, phone: s.phone }, paymentMethod: s.method,
    totalHalalas: s.total, deliveryDate: OPEN.includes(s.status) ? addDays(riyadhToday(), 1) : riyadhToday(new Date(s.at)), createdAt: s.at, items,
    addressSnapshot: pickup ? null : { line: 'شارع أنس بن مالك', district: 'حي الملقا', city: 'الرياض', location: { latitude: 24.8125, longitude: 46.6114 }, notes: 'البوابة الثانية' },
    pickupSnapshot: pickup ? { name: v.name, address: `${v.city ?? ''}، طريق الملك فهد`, location: v.location } : null,
    window: pickup ? null : { start: '16:00', end: '18:00' },
    subtotalHalalas: subtotal, discountHalalas: 0, deliveryFeeHalalas: deliveryFee, vatAmountHalalas: Math.round((s.total * 15) / 115),
    notes: s.no === 482 ? 'الرجاء الاتصال قبل الوصول بربع ساعة' : null,
    cancelReason: s.status === 'cancelled' ? 'طلب العميل الإلغاء' : null,
    payment: { method: s.method, status: s.status === 'cancelled' ? 'refunded' : paid ? 'captured' : 'authorized', walletHalalas: s.method === 'wallet' ? s.total : 0, cardLast4: ['mada', 'card'].includes(s.method) ? '4821' : null },
    refunds: s.status === 'cancelled' ? [{ id: crypto.randomUUID(), amountHalalas: s.total, to: 'original', status: 'succeeded', reason: 'طلب العميل الإلغاء', at: s.at }] : [],
    history: historyOf(s.status, s.at, s.method, pickup),
  };
}

type State = { orders: Map<string, Order>; listeners: Set<(o: OrderSummary) => void>; seq: number };
const g = globalThis as { __orders?: State };
const state: State = (g.__orders ??= { orders: new Map(SEEDS.map(build).map((o) => [o.id, o])), listeners: new Set(), seq: 484 });

const denied = { ok: false, code: 'NOT_ALLOWED', status: 403 } as const;
const notFound = { ok: false, code: 'NOT_FOUND', status: 404 } as const;
const limited = (token: string) => token.endsWith('-limited');
const ok = <T>(data: T): ApiResult<T> => ({ ok: true, data: structuredClone(data) });
const summary = (o: Order): OrderSummary => ({
  id: o.id, number: o.number, status: o.status, orderType: o.orderType, fulfilment: o.fulfilment, vendor: { id: o.vendor.id, name: o.vendor.name },
  customer: { name: o.customer.name }, paymentMethod: o.paymentMethod, totalHalalas: o.totalHalalas, deliveryDate: o.deliveryDate, createdAt: o.createdAt,
});
/** The order when this panel may see it: a vendor only its own (ORD-API-3: vendor A can't see vendor B's orders). */
function visible(token: string, panel: OrdersPanel, id: string): ApiResult<Order> {
  if (limited(token)) return denied;
  const o = state.orders.get(id);
  return o && (panel === 'admin' || o.vendor.id === myVendor().id) ? { ok: true, data: o } : notFound;
}
const move = (o: Order, to: OrderStatus, actorType: Order['history'][number]['actorType'], note: string | null = null) => {
  o.history.push({ from: o.status, to, actorType, note, at: new Date().toISOString() });
  o.status = to;
  if (to === 'delivered' && o.paymentMethod === 'cod') o.payment.status = 'captured';
};

async function daysFor(o: Order): Promise<DayOption[]> {
  const r = await mockOperations.get('mock', 'ar');
  if (!r.ok) return [];
  const s = r.data;
  const today = riyadhToday();
  return Array.from({ length: s.bookingHorizonDays }, (_, i) => {
    const date = addDays(today, i);
    const closed = s.closedDays.some((c) => c.date === date && (c.scope === 'both' || c.scope === o.fulfilment));
    const reason = i === 0 ? 'PAST_CUTOFF' : closed ? 'CLOSED' : undefined;
    return { date, available: !reason, ...(reason && { reason }), window: s.deliveryWindow } as DayOption;
  });
}

export const mockOrders: OrdersBackend = {
  async list(token, _lang, panel, { status, method, vendorId, date, q, cursor, limit = 20 }) {
    if (limited(token)) return denied;
    const words = q?.replace('#', '').trim().toLowerCase();
    const rows = [...state.orders.values()]
      .filter((o) => (panel === 'admin' ? !vendorId || o.vendor.id === vendorId : o.vendor.id === myVendor().id))
      .filter((o) => (!status || o.status === status) && (!method || o.paymentMethod === method) && (!date || o.deliveryDate === date))
      .filter((o) => !words || o.number.toLowerCase().includes(words) || o.customer.name.includes(words))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = Number(cursor ?? 0);
    const next = start + limit < rows.length ? String(start + limit) : null;
    return ok({ items: rows.slice(start, start + limit).map(summary), nextCursor: next });
  },
  async get(token, _lang, panel, id) {
    const r = visible(token, panel, id);
    return r.ok ? ok(r.data) : r;
  },
  async transition(token, _lang, panel, id, { to, note }) {
    const r = visible(token, panel, id);
    if (!r.ok) return r;
    if (!canTransition(r.data, to, panel)) return { ok: false, code: 'ORDER_TRANSITION_NOT_ALLOWED', status: 409, details: { from: r.data.status, to } };
    move(r.data, to, panel, note ?? null);
    return ok(r.data);
  },
  async cancel(token, _lang, id, { reason, refundTo }) {
    const r = visible(token, 'admin', id);
    if (!r.ok) return r;
    const o = r.data;
    if (!canTransition(o, 'cancelled', 'admin')) return { ok: false, code: 'ORDER_TRANSITION_NOT_ALLOWED', status: 409, details: { from: o.status, to: 'cancelled' } };
    // The wallet part always goes back to the wallet (WAL-API-1 reason `refund`); a captured gateway payment where the admin chose.
    const now = new Date().toISOString();
    const paid = o.payment.status === 'captured' ? o.totalHalalas - o.payment.walletHalalas : 0;
    const refund = (amountHalalas: number, to: 'wallet' | 'original') => ({ id: crypto.randomUUID(), amountHalalas, to, status: to === 'wallet' ? 'succeeded' : 'pending', reason, at: now }) as const;
    if (o.payment.walletHalalas > 0) o.refunds.push(refund(o.payment.walletHalalas, 'wallet'));
    if (paid > 0) o.refunds.push(refund(paid, refundTo));
    o.payment.status = o.refunds.length ? 'refunded' : 'cancelled';
    o.cancelReason = reason;
    move(o, 'cancelled', 'admin', reason);
    return ok(o);
  },
  async rescheduleDays(token, _lang, id) {
    const r = visible(token, 'admin', id);
    return r.ok ? ok(await daysFor(r.data)) : r;
  },
  async reschedule(token, _lang, id, date) {
    const r = visible(token, 'admin', id);
    if (!r.ok) return r;
    if (!canReschedule(r.data.status)) return { ok: false, code: 'ORDER_TRANSITION_NOT_ALLOWED', status: 409, details: { from: r.data.status } };
    const day = (await daysFor(r.data)).find((d) => d.date === date);
    if (!day?.available) return { ok: false, code: 'DAY_NOT_AVAILABLE', status: 409, details: { reason: day?.reason ?? 'OUTSIDE_HORIZON' } };
    r.data.deliveryDate = date;
    if (r.data.window) r.data.window = day.window;
    return ok(r.data);
  },
  watch(token, panel, onOrder) {
    const listener = (o: OrderSummary) => !limited(token) && (panel === 'admin' || o.vendor.id === myVendor().id) && onOrder(structuredClone(o));
    state.listeners.add(listener);
    return () => void state.listeners.delete(listener);
  },
};

/**
 * A new order as checkout would place it (test builds only, through /api/mock-orders): «مجازر الفلاح» unless another mock
 * vendor's English name is given; COD orders wait for review (`new`), others arrive `confirmed`.
 */
export function mockPlaceOrder({ vendor = 'Al Falah Butchery', customer = 'عميل تجريبي', method = 'mada' }: { vendor?: string; customer?: string; method?: PaymentMethod }) {
  const no = state.seq++;
  const known = [...mockVendors.values()].some((v) => v.name.en === vendor);
  const o = build({ no, customer, phone: '+966 55 000 0000', vendor: known ? vendor : 'Al Falah Butchery', status: method === 'cod' ? 'new' : 'confirmed', method, total: 19300, at: new Date().toISOString(), items: [ribeye(), strips()] });
  state.orders.set(o.id, o);
  state.listeners.forEach((l) => l(summary(o)));
  return summary(o);
}
