// Admin catalog (CAT-DSH-1) behind one interface: the API through the generated client, or an in-memory mock for local
// work and the Playwright smoke tests (DASHBOARD_API_MOCK=1). The mock keeps the API's shapes, error codes and rules
// (docs/frontend/catalog.md); its uploads and vendors are the other mocks' (vendor-onboarding, admin-vendors).
import { apiCall as call, apiClient, apiHeaders as headers } from '@/api/client';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type {
  ChangeRequest, CreateItem, CreateProduct, CreateRule, Fulfilment, ListName, ListQuery, MediaFile, Page, PageQuery, Prices, Product, ProductCard,
  ProductContent, ProductQuery, RefItem, Rule, UpdateItem, UploadTicket,
} from './types';

export type UploadBody = { purpose: 'catalog.product-image' | 'catalog.category-image'; contentType: string; fileName?: string };
type R<T> = Promise<ApiResult<T>>;

export interface AdminCatalogBackend {
  listItems(token: string, lang: string, list: ListName, query: ListQuery): R<Page<RefItem>>;
  createItem(token: string, lang: string, list: ListName, body: CreateItem): R<RefItem>;
  updateItem(token: string, lang: string, list: ListName, id: string, body: UpdateItem): R<RefItem>;
  listRules(token: string, lang: string, query: ListQuery): R<Page<Rule>>;
  createRule(token: string, lang: string, body: CreateRule): R<Rule>;
  deleteRule(token: string, lang: string, id: string): R<null>;
  listProducts(token: string, lang: string, query: ProductQuery): R<Page<ProductCard>>;
  product(token: string, lang: string, id: string): R<Product>;
  createProduct(token: string, lang: string, body: CreateProduct): R<Product>;
  updateProduct(token: string, lang: string, id: string, body: ProductContent): R<Product>;
  publish(token: string, lang: string, id: string): R<Product>;
  setAvailability(token: string, lang: string, id: string, isAvailable: boolean): R<Product>;
  setFulfilment(token: string, lang: string, id: string, fulfilment: Fulfilment): R<Product>;
  setPrices(token: string, lang: string, id: string, body: Prices): R<Product>;
  requestUpload(token: string, lang: string, body: UploadBody): R<UploadTicket>;
  confirmUpload(token: string, lang: string, id: string): R<MediaFile>;
  // The review queue (CAT-DSH-2): new products (listProducts status=pending_review) and edits of published ones.
  approve(token: string, lang: string, id: string): R<Product>;
  reject(token: string, lang: string, id: string, reason: string): R<Product>;
  listChangeRequests(token: string, lang: string, query: PageQuery): R<Page<ChangeRequest>>;
  approveChange(token: string, lang: string, id: string): R<Product>;
  rejectChange(token: string, lang: string, id: string, reason: string): R<null>;
}

function apiBackend(): AdminCatalogBackend {
  const api = apiClient();
  const id = (x: string) => ({ path: { id: x } });
  return {
    listItems: (token, lang, list, query) => call(api.GET('/v1/admin/lists/{list}', { params: { path: { list }, query }, headers: headers(token, lang) })),
    createItem: (token, lang, list, body) => call(api.POST('/v1/admin/lists/{list}', { params: { path: { list } }, body, headers: headers(token, lang) })),
    updateItem: (token, lang, list, x, body) =>
      call(api.PATCH('/v1/admin/lists/{list}/{id}', { params: { path: { list, id: x } }, body, headers: headers(token, lang) })),
    listRules: (token, lang, query) => call(api.GET('/v1/admin/cutting-packaging-incompatibilities', { params: { query }, headers: headers(token, lang) })),
    createRule: (token, lang, body) => call(api.POST('/v1/admin/cutting-packaging-incompatibilities', { body, headers: headers(token, lang) })),
    deleteRule: (token, lang, x) => call<null>(api.DELETE('/v1/admin/cutting-packaging-incompatibilities/{id}', { params: id(x), headers: headers(token, lang) }), true),
    listProducts: (token, lang, query) => call(api.GET('/v1/admin/products', { params: { query }, headers: headers(token, lang) })),
    product: (token, lang, x) => call(api.GET('/v1/admin/products/{id}', { params: id(x), headers: headers(token, lang) })),
    createProduct: (token, lang, body) => call(api.POST('/v1/admin/products', { body, headers: headers(token, lang) })),
    updateProduct: (token, lang, x, body) => call(api.PUT('/v1/admin/products/{id}', { params: id(x), body, headers: headers(token, lang) })),
    publish: (token, lang, x) => call(api.POST('/v1/admin/products/{id}/publish', { params: id(x), headers: headers(token, lang) })),
    setAvailability: (token, lang, x, isAvailable) =>
      call(api.PATCH('/v1/admin/products/{id}/availability', { params: id(x), body: { isAvailable }, headers: headers(token, lang) })),
    setFulfilment: (token, lang, x, fulfilment) =>
      call(api.PATCH('/v1/admin/products/{id}/fulfilment', { params: id(x), body: { fulfilment }, headers: headers(token, lang) })),
    setPrices: (token, lang, x, body) => call(api.PATCH('/v1/admin/products/{id}/prices', { params: id(x), body, headers: headers(token, lang) })),
    requestUpload: (token, lang, body) => call(api.POST('/v1/admin/media/uploads', { body, headers: headers(token, lang) })),
    confirmUpload: (token, lang, x) => call(api.POST('/v1/admin/media/{id}/confirm', { params: id(x), headers: headers(token, lang) })),
    approve: (token, lang, x) => call(api.POST('/v1/admin/products/{id}/approve', { params: id(x), headers: headers(token, lang) })),
    reject: (token, lang, x, reason) => call(api.POST('/v1/admin/products/{id}/reject', { params: id(x), body: { reason }, headers: headers(token, lang) })),
    listChangeRequests: (token, lang, query) => call(api.GET('/v1/admin/product-change-requests', { params: { query }, headers: headers(token, lang) })),
    approveChange: (token, lang, x) => call(api.POST('/v1/admin/product-change-requests/{id}/approve', { params: id(x), headers: headers(token, lang) })),
    rejectChange: (token, lang, x, reason) =>
      call<null>(api.POST('/v1/admin/product-change-requests/{id}/reject', { params: id(x), body: { reason }, headers: headers(token, lang) }), true),
  };
}

export function adminCatalogBackend(): AdminCatalogBackend {
  return mockBackends()?.adminCatalog ?? apiBackend();
}
