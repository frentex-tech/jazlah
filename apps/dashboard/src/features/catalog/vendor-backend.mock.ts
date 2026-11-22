// The in-process mock of vendor-backend.ts (DASHBOARD_API_MOCK=1): loaded only through lib/mock-backends.ts, so a
// production build leaves it out.
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockVendors } from '@/features/admin-vendors/backend.mock';
import { availabilityOf, card, contentOf, contentResponse, mock, newPrices, notFound, page, patchOwn, unsubmittable } from './backend.mock';
import type { ChangeRequest, NamedRef, Product, RefItem } from './types';
import type { VendorCatalogBackend } from './vendor-backend';

// The mock vendor session is «مجازر الفلاح» (the store profile mock). An access token ending in «-suspended» answers
// VENDOR_SUSPENDED as the API does for a suspended store (131:26015).
const vendor = () => [...mockVendors.values()].find((v) => v.name.en === 'Al Falah Butchery')!;
const suspended = (token: string) => token.endsWith('-suspended');
const SUSPENDED = { ok: false, code: 'VENDOR_SUSPENDED', status: 403 } as const;
const notEditable = (p: Product) => ({ ok: false, code: 'PRODUCT_NOT_EDITABLE', status: 409, details: { status: p.status } }) as const;

function mine(token: string, id: string): ApiResult<Product> {
  if (suspended(token)) return SUSPENDED;
  const p = mock.products.get(id);
  return p && p.vendorId === vendor().id ? { ok: true, data: p } : notFound;
}
const named = (x: RefItem): NamedRef => ({ id: x.id, name: x.name });

export const mockVendorCatalog: VendorCatalogBackend = {
  async categories() {
    return { ok: true, data: { items: mock.items.categories.filter((c) => c.isActive) } };
  },
  async list(token, _l, list) {
    if (suspended(token)) return SUSPENDED;
    return { ok: true, data: { items: [...mock.items[list]].filter((x) => x.isActive).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(named) } };
  },
  async rules(token) {
    if (suspended(token)) return SUSPENDED;
    const styles = mock.items['cutting-styles'];
    const items = mock.rules.flatMap((r) => {
      const s = styles.find((x) => x.id === r.cuttingStyleId && x.isActive);
      return s ? [{ cuttingStyle: named(s), packaging: r.packaging }] : [];
    });
    return { ok: true, data: { items } };
  },
  async listProducts(token, _l, { status, cursor, limit }) {
    if (suspended(token)) return SUSPENDED;
    return page([...mock.products.values()].filter((p) => p.vendorId === vendor().id && (!status || p.status === status)).map(card), cursor, limit);
  },
  async product(token, _l, id) {
    return mine(token, id);
  },
  async createProduct(token, _l, body) {
    if (suspended(token)) return SUSPENDED;
    const c = contentOf(body, null);
    if (!c.ok) return c;
    const now = new Date().toISOString();
    const p: Product = {
      id: crypto.randomUUID(), vendorId: vendor().id, status: 'draft', isAvailable: true, fulfilment: body.fulfilment, ...c.data, rejectionReason: null,
      submittedAt: null, reviewedAt: null, publishedAt: null, createdAt: now, updatedAt: now, changeRequest: null,
    };
    mock.products.set(p.id, p);
    return { ok: true, status: 201, data: p };
  },
  async updateProduct(token, _l, id, body) {
    const r = mine(token, id);
    if (!r.ok) return r;
    const p = r.data;
    if (p.status === 'pending_review') return notEditable(p);
    const c = contentOf(body, p);
    if (!c.ok) return c;
    const now = new Date().toISOString();
    if (p.status !== 'published') {
      const next = { ...p, ...c.data, updatedAt: now };
      mock.products.set(id, next);
      return { ok: true, data: next };
    }
    // A published product does not change: the edit becomes the pending change request (the older one superseded).
    const blocked = unsubmittable(c.data);
    if (blocked) return blocked;
    mock.changeRequests = mock.changeRequests.map((x) => (x.productId === id && x.status === 'pending' ? { ...x, status: 'superseded', updatedAt: now } : x));
    const cr: ChangeRequest = { id: crypto.randomUUID(), productId: id, status: 'pending', content: contentResponse(c.data), rejectionReason: null, createdAt: now, updatedAt: now, reviewedAt: null };
    mock.changeRequests.push(cr);
    const next = { ...p, changeRequest: cr };
    mock.products.set(id, next);
    return { ok: true, data: next };
  },
  async submit(token, _l, id) {
    const r = mine(token, id);
    if (!r.ok) return r;
    if (r.data.status !== 'draft' && r.data.status !== 'rejected') return notEditable(r.data);
    const now = new Date().toISOString();
    return unsubmittable(r.data) ?? patchOwn(token, id, () => ({ status: 'pending_review', submittedAt: now, changeRequest: null }), vendor().id);
  },
  async setAvailability(token, _l, id, body) {
    return suspended(token) ? SUSPENDED : quiet(patchOwn(token, id, (p) => availabilityOf(p, body), vendor().id));
  },
  async setFulfilment(token, _l, id, fulfilment) {
    return suspended(token) ? SUSPENDED : quiet(patchOwn(token, id, () => ({ fulfilment }), vendor().id));
  },
  async setPrices(token, _l, id, body) {
    if (suspended(token)) return SUSPENDED;
    return quiet(patchOwn(token, id, (p) => newPrices(p, body), vendor().id));
  },
};

/** The API's other writes answer `changeRequest: null` even when one exists (ProductResponseDto.changeRequest). */
const quiet = (r: ApiResult<Product>): ApiResult<Product> => (r.ok ? { ...r, data: { ...r.data, changeRequest: null } } : r);
