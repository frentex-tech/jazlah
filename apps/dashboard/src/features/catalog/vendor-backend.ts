// The vendor's own products (CAT-DSH-2) behind one interface: the API through the generated client, or a mock on the
// admin catalog's mock store (backend.ts), so a product the mock vendor submits reaches the admin review queue.
import { apiCall as call, apiClient, apiHeaders as headers } from '@/api/client';
import type { ApiResult } from '@/lib/auth/panel-session';
import { mockBackends } from '@/lib/mock-backends';
import type {
  CreateProduct, Fulfilment, NamedRef, Page, Prices, Product, ProductCard, ProductContent, ProductQuery, RefItem, VendorList, VendorRule,
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

export function vendorCatalogBackend(): VendorCatalogBackend {
  return mockBackends()?.vendorCatalog ?? apiBackend();
}
