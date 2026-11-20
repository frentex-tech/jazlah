// The vendor's own products (CAT-DSH-2) behind one interface: the API through the generated client, or a mock on the
// admin catalog's mock store (backend.ts), so a product the mock vendor submits reaches the admin review queue.
import { apiCall as call, apiClient, apiHeaders as headers } from '@/api/client';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mocksEnabled } from '@/lib/mock';
import { mockVendors } from '@/features/admin-vendors/backend';
import { card, contentOf, contentResponse, mock, newPrices, notFound, page, patchOwn, unsubmittable } from './backend';
import type {
  ChangeRequest, CreateProduct, Fulfilment, NamedRef, Page, Prices, Product, ProductCard, ProductContent, ProductQuery, RefItem, VendorList, VendorRule,
} from './types';

type R<T> = Promise<ApiResult<T>>;

export interface VendorCatalogBackend {
  /** Active categories (GET /v1/public/categories: the vendor lists have no categories). */
  categories(lang: string): R<{ items: RefItem[] }>;
  list(token: string, lang: string, list: VendorList): R<{ items: NamedRef[] }>;
  rules(token: string, lang: string): R<{ items: VendorRule[] }>;
  listProducts(token: string, lang: string, query: Omit<ProductQuery, 'vendorId'>): R<Page<ProductCard>>;
  product(token: string, lang: string, id: string): R<Product>;
  createProduct(token: string, lang: string, body: CreateProduct): R<Product>;
  updateProduct(token: string, lang: string, id: string, body: ProductContent): R<Product>;
  submit(token: string, lang: string, id: string): R<Product>;
  setAvailability(token: string, lang: string, id: string, isAvailable: boolean): R<Product>;
  setFulfilment(token: string, lang: string, id: string, fulfilment: Fulfilment): R<Product>;
  setPrices(token: string, lang: string, id: string, body: Prices): R<Product>;
}

function apiBackend(): VendorCatalogBackend {
  const api = apiClient();
  const id = (x: string) => ({ path: { id: x } });
  return {
    categories: (lang) => call(api.GET('/v1/public/categories', { headers: headers(null, lang) })),
    list: (token, lang, list) => call(api.GET('/v1/vendor/lists/{list}', { params: { path: { list } }, headers: headers(token, lang) })),
    rules: (token, lang) => call(api.GET('/v1/vendor/cutting-packaging-incompatibilities', { headers: headers(token, lang) })),
    listProducts: (token, lang, query) => call(api.GET('/v1/vendor/products', { params: { query }, headers: headers(token, lang) })),
    product: (token, lang, x) => call(api.GET('/v1/vendor/products/{id}', { params: id(x), headers: headers(token, lang) })),
    createProduct: (token, lang, body) => call(api.POST('/v1/vendor/products', { body, headers: headers(token, lang) })),
    updateProduct: (token, lang, x, body) => call(api.PUT('/v1/vendor/products/{id}', { params: id(x), body, headers: headers(token, lang) })),
    submit: (token, lang, x) => call(api.POST('/v1/vendor/products/{id}/submit', { params: id(x), headers: headers(token, lang) })),
    setAvailability: (token, lang, x, isAvailable) =>
      call(api.PATCH('/v1/vendor/products/{id}/availability', { params: id(x), body: { isAvailable }, headers: headers(token, lang) })),
    setFulfilment: (token, lang, x, fulfilment) =>
      call(api.PATCH('/v1/vendor/products/{id}/fulfilment', { params: id(x), body: { fulfilment }, headers: headers(token, lang) })),
    setPrices: (token, lang, x, body) => call(api.PATCH('/v1/vendor/products/{id}/prices', { params: id(x), body, headers: headers(token, lang) })),
  };
}

// ---- Mock ----
// The mock vendor session is «مجازر الفلاح» (the store profile mock). Its store suspended in the admin vendors mock,
// or an access token ending in «-suspended», answers VENDOR_SUSPENDED as the API does (131:26015).
const vendor = () => [...mockVendors.values()].find((v) => v.name.en === 'Al Falah Butchery')!;
const suspended = (token: string) => token.endsWith('-suspended') || vendor().status === 'suspended';
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
  async setAvailability(token, _l, id, isAvailable) {
    return suspended(token) ? SUSPENDED : quiet(patchOwn(token, id, () => ({ isAvailable }), vendor().id));
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

export function vendorCatalogBackend(): VendorCatalogBackend {
  return mocksEnabled() ? mockVendorCatalog : apiBackend();
}
