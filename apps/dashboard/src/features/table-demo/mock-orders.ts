// Demo data for the DataTable demo page (APP-DSH-1 acceptance: paginates against a mocked endpoint).
export const DEMO_STATUSES = ['preparing', 'delivered', 'review', 'cancelled', 'new'] as const;
export type DemoStatus = (typeof DEMO_STATUSES)[number];
export type DemoOrder = { id: string; number: number; customer: string; store: string; status: DemoStatus; amountHalalas: number; date: string };

const customers = ['سعد العتيبي', 'نورة القحطاني', 'فهد الدوسري', 'ريم الغامدي', 'خالد الشمري', 'منى الزهراني'];
const stores = ['مجازر الفلاح', 'ذبائح الرياض', 'أسواق الراعي'];

export const DEMO_ORDERS: DemoOrder[] = Array.from({ length: 128 }, (_, i) => ({
  id: `o${i}`,
  number: 10482 - i,
  customer: customers[i % customers.length]!,
  store: stores[i % stores.length]!,
  status: DEMO_STATUSES[i % DEMO_STATUSES.length]!,
  amountHalalas: 8900 + ((i * 3779) % 120000),
  date: new Date(Date.UTC(2026, 10, 10) - Math.floor(i / 4) * 86_400_000).toISOString(),
}));

export type DemoQuery = { page: number; pageSize: number; status?: string; q?: string; sort?: string };

export function queryDemoOrders({ page, pageSize, status, q, sort }: DemoQuery) {
  let rows = DEMO_ORDERS.filter((o) => (!status || o.status === status) && (!q || o.customer.includes(q) || String(o.number).includes(q)));
  if (sort) {
    const [key, dir] = sort.split(':') as [keyof DemoOrder, string];
    rows = [...rows].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * (dir === 'desc' ? -1 : 1));
  }
  return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length };
}
