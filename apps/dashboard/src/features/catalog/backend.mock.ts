// The in-process mock of backend.ts (DASHBOARD_API_MOCK=1): loaded only through lib/mock-backends.ts, so a production
// build leaves it out.
import type { ApiResult } from '@/lib/auth/panel-session';
import { MOCK_PLATFORM as PLATFORM, mockVendors } from '@/features/admin-vendors/backend.mock';
import { mockMedia } from '@/features/vendor-onboarding/backend.mock';
import type { ChangeRequest, ListName, Page, Prices, Product, ProductCard, ProductContent, RefItem, Rule } from './types';
import type { AdminCatalogBackend } from './backend';

// Seeds follow the frames: categories 131:19875, products 131:21286, the product form's cuts, packagings and "without"
// items 131:35405. An admin whose mock access token ends in «-limited» is answered NOT_ALLOWED (131:20824, 131:22394,
// 131:37786); the API's FORBIDDEN ends the session (errors.md).
const PHOTO = ['/login/vendor.jpg', '/login/admin.jpg'];
const sid = (kind: string, n: number) => `${kind}000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const day = (d: number) => new Date(Date.UTC(2026, 10, d, 9)).toISOString();
const named = (ar: string, en: string) => ({ ar, en });

const CATEGORIES: [string, string, boolean][] = [
  ['الأغنام', 'Sheep', true], ['الأبقار', 'Cattle', true], ['الإبل', 'Camel', false], ['الدواجن', 'Poultry', true],
  ['المفرومات', 'Minced', true], ['المشويات', 'Grills', true], ['الولائم', 'Feasts', true],
];
const CUTS: [string, string][] = [
  ['تقطيع شرائح', 'Sliced'], ['مكعبات', 'Cubes'], ['مفروم ناعم', 'Fine mince'], ['قطعة كاملة', 'Whole piece'], ['شرائح سميكة', 'Thick slices'], ['عظم مفصّل', 'Jointed bone'],
];
const EXCLUSIONS: [string, string][] = [['بدون دهون زائدة', 'No extra fat'], ['بدون عظم', 'Boneless'], ['بدون جلد', 'Skinless'], ['بدون غضاريف', 'No cartilage']];
const MEAT_TYPES: [string, string][] = [['نعيمي', 'Naimi'], ['نجدي', 'Najdi'], ['حري', 'Harri'], ['بقري بلدي', 'Local beef']];
const item = (kind: string, i: number, [ar, en]: [string, string], ordered: boolean, isActive = true): RefItem => ({
  id: sid(kind, i + 1), name: named(ar, en), isActive, sortOrder: ordered ? i + 1 : null, imageUrl: ordered ? PHOTO[i % 2]! : null, createdAt: day(1 + i),
});


type MockState = { items: Record<ListName, RefItem[]>; rules: Rule[]; products: Map<string, Product>; seedImages: Map<string, string>; changeRequests: ChangeRequest[] };
const g = globalThis as { __adminCatalog?: MockState };
/** The catalog mock store, shared with the vendor catalog mock (vendor-backend.ts): a submitted product reaches the queue. */
export const mock: MockState = (g.__adminCatalog ??= seed());
mock.changeRequests ??= []; // a store kept across a dev reload from before CAT-DSH-2

function seed(): MockState {
  const items: Record<ListName, RefItem[]> = {
    categories: CATEGORIES.map(([ar, en, active], i) => item('c1', i, [ar, en], true, active)),
    'meat-types': MEAT_TYPES.map((n, i) => item('c2', i, n, false)),
    'cutting-styles': CUTS.map((n, i) => item('c3', i, n, false)),
    'exclusion-items': EXCLUSIONS.map((n, i) => item('c4', i, n, false)),
  };
  const cut = (i: number) => items['cutting-styles'][i]!;
  // The matrix of 131:35405: fine mince not in cartons or gift wrap, whole piece not vacuum, … (in the API's packagings).
  const rules: Rule[] = [
    { id: sid('d1', 1), cuttingStyleId: cut(2).id, packaging: 'bags', createdAt: day(2) },
    { id: sid('d1', 2), cuttingStyleId: cut(2).id, packaging: 'none', createdAt: day(2) },
    { id: sid('d1', 3), cuttingStyleId: cut(3).id, packaging: 'vacuum', createdAt: day(3) },
    { id: sid('d1', 4), cuttingStyleId: cut(4).id, packaging: 'none', createdAt: day(3) },
    { id: sid('d1', 5), cuttingStyleId: cut(5).id, packaging: 'trays', createdAt: day(4) },
    { id: sid('d1', 6), cuttingStyleId: cut(5).id, packaging: 'none', createdAt: day(4) },
  ];
  const seedImages = new Map<string, string>();
  const vendors = [...mockVendors.values()];
  const vendorOf = (en: string) => vendors.find((v) => v.name.en === en) ?? PLATFORM;
  const cat = (i: number) => items.categories[i]!;
  const products = new Map<string, Product>();
  const rows: [string, string, string, number, number, Product['status'], boolean, number][] = [
    // name ar, name en, vendor (en), category index, price (halalas), status, available, created day
    ['ريب آي بقري طازج', 'Fresh beef ribeye', 'Al Falah Butchery', 1, 8900, 'published', true, 10],
    ['فخذ غنم نعيمي', 'Naimi lamb leg', 'Riyadh Carcasses', 0, 16500, 'pending_review', true, 11],
    ['مندي لحم للولائم', 'Feast mandi lamb', 'JAZLA', 6, 42000, 'published', false, 9],
    ['تي بون بقري', 'Beef T-bone', 'Al Falah Butchery', 1, 11800, 'rejected', true, 8],
    ['ضلوع غنم للمشاوي', 'Lamb ribs for grilling', 'JAZLA', 5, 11200, 'published', true, 7],
    ['لحم مفروم ناعم', 'Fine minced meat', 'JAZLA', 4, 7400, 'draft', true, 6],
    // CAT-DSH-2: a vendor draft (131:25074) and a published product with an edit waiting for review (131:22954).
    ['ستيك مخلّل بالثوم', 'Garlic marinated steak', 'Al Falah Butchery', 1, 9600, 'draft', true, 5],
    ['كتف غنم للتحمير', 'Lamb shoulder for roasting', 'Riyadh Carcasses', 0, 13500, 'published', true, 4],
  ];
  rows.forEach(([ar, en, vendor, c, price, status, isAvailable, d], i) => {
    const imageId = sid('e1', i + 1);
    seedImages.set(imageId, PHOTO[i % 2]!);
    const v = vendorOf(vendor);
    const p: Product = {
      id: sid('b1', i + 1), vendorId: v.id, status, isAvailable, fulfilment: 'both', name: named(ar, en), description: { ar: null, en: null },
      category: { id: cat(c).id, name: cat(c).name }, meatType: null, images: [{ mediaId: imageId, url: PHOTO[i % 2]! }],
      sizes: [
        { id: sid('f1', i * 10 + 1), approxWeightGrams: 500, priceHalalas: price, tag: named('وسط', 'Medium'), isAvailable: true },
        { id: sid('f1', i * 10 + 2), approxWeightGrams: 1000, priceHalalas: price * 2 - 800, tag: named('كبير', 'Large'), isAvailable: true },
      ],
      cuttings: [0, 1].map((k) => ({ cuttingStyleId: cut(k).id, name: cut(k).name, extraPriceHalalas: 0 })),
      packagings: [{ packaging: 'vacuum', extraPriceHalalas: 0 }, { packaging: 'trays', extraPriceHalalas: 300 }],
      exclusions: [{ id: items['exclusion-items'][0]!.id, name: items['exclusion-items'][0]!.name }],
      minPriceHalalas: price, rejectionReason: status === 'rejected' ? 'الصور غير واضحة، أعد رفعها بجودة أعلى.' : null,
      submittedAt: v.isPlatform || status === 'draft' ? null : day(d), reviewedAt: status === 'published' || status === 'rejected' ? day(d + 1) : null,
      publishedAt: status === 'published' ? day(d + 1) : null, createdAt: day(d), updatedAt: day(d + 1), changeRequest: null,
    };
    products.set(p.id, p);
  });
  const shoulder = [...products.values()].find((p) => p.name.en === 'Lamb shoulder for roasting')!;
  const changeRequests: ChangeRequest[] = [{
    id: sid('g1', 1), productId: shoulder.id, status: 'pending', rejectionReason: null, createdAt: day(12), updatedAt: day(12), reviewedAt: null,
    content: { ...contentResponse(shoulder), images: [...shoulder.images].reverse().concat({ mediaId: sid('e1', 1), url: PHOTO[0]! }) },
  }];
  shoulder.changeRequest = changeRequests[0]!;
  return { items, rules, products, seedImages, changeRequests };
}

/** A product's content as a change request holds it (ProductContentResponseDto): its cuttings carry no names (null). */
export function contentResponse(p: Pick<Product, 'name' | 'description' | 'category' | 'meatType' | 'images' | 'sizes' | 'cuttings' | 'packagings' | 'exclusions'>): ChangeRequest['content'] {
  return {
    name: p.name, description: p.description, categoryId: p.category.id, meatTypeId: p.meatType?.id ?? null, images: p.images, sizes: p.sizes,
    cuttings: p.cuttings.map((c) => ({ ...c, name: null })), packagings: p.packagings, exclusionItemIds: p.exclusions.map((x) => x.id),
  };
}

export const notFound = { ok: false, code: 'NOT_FOUND', status: 404 } as const;
const forbidden = { ok: false, code: 'NOT_ALLOWED', status: 403 } as const;
export const invalid = (field: string, constraint: string) => ({ ok: false, code: 'VALIDATION_FAILED', status: 400, details: [{ field, constraints: [constraint] }] }) as const;
const limited = (token: string) => token.endsWith('-limited');

/** Newest first by createdAt, cursor = the offset as the API would write it (opaque to the page), limit 1..50 (default 20). */
export function page<T extends { createdAt: string }>(items: T[], cursor?: string, limit = 20): ApiResult<Page<T>> {
  const from = cursor === undefined ? 0 : Number(Buffer.from(cursor, 'base64url').toString());
  if (!Number.isInteger(from) || from < 0) return invalid('cursor', 'isCursor');
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const next = from + limit < sorted.length ? Buffer.from(String(from + limit)).toString('base64url') : null;
  return { ok: true, data: { items: sorted.slice(from, from + limit), nextCursor: next } };
}

export const card = (p: Product): ProductCard => ({
  id: p.id, vendor: { id: p.vendorId, name: mockVendors.get(p.vendorId)?.name ?? null }, name: p.name, categoryId: p.category.id,
  meatTypeId: p.meatType?.id ?? null, status: p.status, isAvailable: p.isAvailable, minPriceHalalas: p.minPriceHalalas, coverUrl: p.images[0]?.url ?? null,
  createdAt: p.createdAt,
});
const active = (list: ListName, id: string) => mock.items[list].find((x) => x.id === id && x.isActive);
const ref = (x: RefItem) => ({ id: x.id, name: x.name });

/** The submission rules of publish and of an edit of a published product (PRODUCT_NOT_SUBMITTABLE). */
export function unsubmittable(p: Pick<Product, 'sizes' | 'images' | 'cuttings' | 'packagings'>): ApiResult<never> | null {
  const pairs = p.cuttings.flatMap((c) =>
    p.packagings.filter((k) => mock.rules.some((r) => r.cuttingStyleId === c.cuttingStyleId && r.packaging === k.packaging)).map((k) => ({ cuttingStyleId: c.cuttingStyleId, packaging: k.packaging })),
  );
  const reasons = [...(p.sizes.length ? [] : ['NO_SIZE']), ...(p.images.length ? [] : ['NO_IMAGE']), ...(pairs.length ? ['INCOMPATIBLE_CUTTING_PACKAGING'] : [])];
  return reasons.length ? { ok: false, code: 'PRODUCT_NOT_SUBMITTABLE', status: 422, details: { reasons, pairs } } : null;
}

/** The content as the product holds it, with the API's reference and media checks; `live`: the edited product. */
export function contentOf(body: ProductContent, live: Product | null): ApiResult<Omit<Product, 'id' | 'vendorId' | 'status' | 'isAvailable' | 'fulfilment' | 'rejectionReason' | 'submittedAt' | 'reviewedAt' | 'publishedAt' | 'createdAt' | 'updatedAt' | 'changeRequest'>> {
  const category = active('categories', body.categoryId);
  if (!category) return invalid('categoryId', 'isActiveCategory');
  const meat = body.meatTypeId ? active('meat-types', body.meatTypeId) : null;
  if (body.meatTypeId && !meat) return invalid('meatTypeId', 'isActiveMeatType');
  const images: Product['images'] = [];
  for (const mediaId of body.imageMediaIds) {
    const kept = live?.images.find((i) => i.mediaId === mediaId) ?? (mock.seedImages.has(mediaId) ? { mediaId, url: mock.seedImages.get(mediaId)! } : null);
    if (kept) {
      images.push(kept);
      continue;
    }
    const m = mockMedia.ready(mediaId);
    if (!m || m.purpose !== 'catalog.product-image') return { ok: false, code: 'MEDIA_NOT_FOUND', status: 404, details: { mediaId } };
    if (!m.url) return { ok: false, code: 'MEDIA_NOT_READY', status: 409, details: { mediaId } };
    images.push({ mediaId, url: m.url });
  }
  const sizes: Product['sizes'] = [];
  for (const [i, s] of body.sizes.entries()) {
    const old = s.id ? live?.sizes.find((x) => x.id === s.id) : null;
    if (s.id && !old) return invalid(`sizes.${i}.id`, 'isSizeOfProduct');
    if (old && old.priceHalalas !== s.priceHalalas) return invalid(`sizes.${i}.priceHalalas`, 'isLivePrice');
    sizes.push({ id: s.id ?? crypto.randomUUID(), approxWeightGrams: s.approxWeightGrams, priceHalalas: s.priceHalalas, tag: s.tag ?? null, isAvailable: true });
  }
  const cuttings: Product['cuttings'] = [];
  for (const [i, c] of body.cuttings.entries()) {
    const old = live?.cuttings.find((x) => x.cuttingStyleId === c.cuttingStyleId);
    const style = active('cutting-styles', c.cuttingStyleId) ?? (old ? mock.items['cutting-styles'].find((x) => x.id === c.cuttingStyleId) : undefined);
    if (!style) return invalid(`cuttings.${i}.cuttingStyleId`, 'isActiveCuttingStyle');
    if (old && old.extraPriceHalalas !== c.extraPriceHalalas) return invalid(`cuttings.${i}.extraPriceHalalas`, 'isLivePrice');
    cuttings.push({ cuttingStyleId: style.id, name: style.name, extraPriceHalalas: c.extraPriceHalalas });
  }
  for (const [i, k] of body.packagings.entries()) {
    const old = live?.packagings.find((x) => x.packaging === k.packaging);
    if (old && old.extraPriceHalalas !== k.extraPriceHalalas) return invalid(`packagings.${i}.extraPriceHalalas`, 'isLivePrice');
  }
  const exclusions: Product['exclusions'] = [];
  for (const [i, x] of body.exclusionItemIds.entries()) {
    const e = active('exclusion-items', x);
    if (!e) return invalid(`exclusionItemIds.${i}`, 'isActiveExclusionItem');
    exclusions.push(ref(e));
  }
  return {
    ok: true,
    data: {
      name: { ar: body.name.ar.trim(), en: body.name.en.trim() },
      description: { ar: body.description?.ar?.trim() || null, en: body.description?.en?.trim() || null },
      category: ref(category), meatType: meat ? ref(meat) : null, images, sizes, cuttings, packagings: body.packagings, exclusions,
      minPriceHalalas: sizes.length ? Math.min(...sizes.map((s) => s.priceHalalas)) : null,
    },
  };
}

/** A change of a product of `vendorId` (JAZLA's by default), refused while it is under review. */
export function patchOwn(token: string, id: string, change: (p: Product) => ApiResult<Product> | Partial<Product>, vendorId = PLATFORM.id): ApiResult<Product> {
  if (limited(token)) return forbidden;
  const found = mock.products.get(id);
  const p = found?.vendorId === vendorId ? found : null;
  if (!p) return notFound;
  if (p.status === 'pending_review') return { ok: false, code: 'PRODUCT_NOT_EDITABLE', status: 409, details: { status: p.status } };
  const r = change(p);
  if ('ok' in r) {
    if (r.ok) mock.products.set(id, r.data);
    return r;
  }
  const next = { ...p, ...r, updatedAt: new Date().toISOString() };
  mock.products.set(id, next);
  return { ok: true, data: next };
}

export const mockAdminCatalog: AdminCatalogBackend = {
  async listItems(token, _l, list, { cursor, limit, isActive }) {
    if (limited(token)) return forbidden;
    return page(mock.items[list].filter((x) => !isActive || String(x.isActive) === isActive), cursor, limit);
  },
  async createItem(token, _l, list, body) {
    if (limited(token)) return forbidden;
    if (list !== 'categories' && body.sortOrder !== undefined) return invalid('sortOrder', 'isOrderedList');
    if (list !== 'categories' && body.imageMediaId) return invalid('imageMediaId', 'isCategoryList');
    const image = body.imageMediaId ? mockMedia.ready(body.imageMediaId) : null;
    if (body.imageMediaId && (!image || image.purpose !== 'catalog.category-image')) return { ok: false, code: 'MEDIA_NOT_FOUND', status: 404, details: { mediaId: body.imageMediaId } };
    const x: RefItem = {
      id: crypto.randomUUID(), name: { ar: body.name.ar.trim(), en: body.name.en.trim() }, isActive: true,
      sortOrder: list === 'categories' ? (body.sortOrder ?? 0) : null, imageUrl: image?.url ?? null, createdAt: new Date().toISOString(),
    };
    mock.items[list].push(x);
    return { ok: true, status: 201, data: x };
  },
  async updateItem(token, _l, list, id, body) {
    if (limited(token)) return forbidden;
    const i = mock.items[list].findIndex((x) => x.id === id);
    if (i < 0) return notFound;
    if (list !== 'categories' && body.sortOrder !== undefined) return invalid('sortOrder', 'isOrderedList');
    if (list !== 'categories' && body.imageMediaId !== undefined) return invalid('imageMediaId', 'isCategoryList');
    const image = body.imageMediaId ? mockMedia.ready(body.imageMediaId) : null;
    if (body.imageMediaId && (!image || image.purpose !== 'catalog.category-image')) return { ok: false, code: 'MEDIA_NOT_FOUND', status: 404, details: { mediaId: body.imageMediaId } };
    const old = mock.items[list][i]!;
    const x: RefItem = {
      ...old,
      ...(body.name && { name: { ar: body.name.ar.trim(), en: body.name.en.trim() } }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.imageMediaId !== undefined && { imageUrl: image?.url ?? null }),
    };
    mock.items[list][i] = x;
    return { ok: true, data: x };
  },
  async listRules(token, _l, { cursor, limit }) {
    if (limited(token)) return forbidden;
    return page(mock.rules, cursor, limit);
  },
  async createRule(token, _l, body) {
    if (limited(token)) return forbidden;
    if (!active('cutting-styles', body.cuttingStyleId)) return invalid('cuttingStyleId', 'isActiveCuttingStyle');
    if (mock.rules.some((r) => r.cuttingStyleId === body.cuttingStyleId && r.packaging === body.packaging)) return { ok: false, code: 'CONFLICT', status: 409 };
    const r: Rule = { id: crypto.randomUUID(), ...body, createdAt: new Date().toISOString() };
    mock.rules.push(r);
    return { ok: true, status: 201, data: r };
  },
  async deleteRule(token, _l, id) {
    if (limited(token)) return forbidden;
    const i = mock.rules.findIndex((r) => r.id === id);
    if (i < 0) return notFound;
    mock.rules.splice(i, 1);
    return { ok: true, data: null, status: 204 };
  },
  async listProducts(token, _l, { status, vendorId, cursor, limit }) {
    if (limited(token)) return forbidden;
    return page([...mock.products.values()].filter((p) => (!status || p.status === status) && (!vendorId || p.vendorId === vendorId)).map(card), cursor, limit);
  },
  async product(token, _l, id) {
    if (limited(token)) return forbidden;
    const p = mock.products.get(id);
    return p ? { ok: true, data: p } : notFound;
  },
  async createProduct(token, _l, body) {
    if (limited(token)) return forbidden;
    const c = contentOf(body, null);
    if (!c.ok) return c;
    const now = new Date().toISOString();
    const p: Product = {
      id: crypto.randomUUID(), vendorId: PLATFORM.id, status: 'draft', isAvailable: true, fulfilment: body.fulfilment, ...c.data, rejectionReason: null,
      submittedAt: null, reviewedAt: null, publishedAt: null, createdAt: now, updatedAt: now, changeRequest: null,
    };
    mock.products.set(p.id, p);
    return { ok: true, status: 201, data: p };
  },
  async updateProduct(token, _l, id, body) {
    return patchOwn(token, id, (p) => {
      const c = contentOf(body, p);
      if (!c.ok) return c;
      if (p.status === 'published') {
        const blocked = unsubmittable(c.data);
        if (blocked) return blocked;
      }
      return c.data;
    });
  },
  async publish(token, _l, id) {
    return patchOwn(token, id, (p) => {
      if (p.status !== 'draft') return { ok: false, code: 'PRODUCT_NOT_EDITABLE', status: 409, details: { status: p.status } };
      const now = new Date().toISOString();
      return unsubmittable(p) ?? { status: 'published', reviewedAt: now, publishedAt: now };
    });
  },
  async setAvailability(token, _l, id, isAvailable) {
    return patchOwn(token, id, () => ({ isAvailable }));
  },
  async setFulfilment(token, _l, id, fulfilment) {
    return patchOwn(token, id, () => ({ fulfilment }));
  },
  async setPrices(token, _l, id, body) {
    return patchOwn(token, id, (p) => newPrices(p, body));
  },
  async requestUpload(token, _l, body) {
    if (limited(token)) return forbidden;
    return mockMedia.ticket(body.purpose, body);
  },
  async confirmUpload(token, _l, id) {
    if (limited(token)) return forbidden;
    return mockMedia.confirm(id);
  },
  async approve(token, _l, id) {
    return decide(token, id, () => ({ status: 'published', rejectionReason: null, publishedAt: new Date().toISOString() }));
  },
  async reject(token, _l, id, reason) {
    return decide(token, id, () => ({ status: 'rejected', rejectionReason: reason.trim() }));
  },
  async listChangeRequests(token, _l, { cursor, limit }) {
    if (limited(token)) return forbidden;
    return page(mock.changeRequests.filter((c) => c.status === 'pending'), cursor, limit);
  },
  async approveChange(token, _l, id) {
    if (limited(token)) return forbidden;
    const c = openChange(id);
    if (!c.ok) return c;
    const p = mock.products.get(c.data.productId)!;
    if (p.status !== 'published') return { ok: false, code: 'PRODUCT_NOT_EDITABLE', status: 409, details: { status: p.status } };
    const now = new Date().toISOString();
    const cr: ChangeRequest = { ...c.data, status: 'approved', updatedAt: now, reviewedAt: now };
    mock.changeRequests = mock.changeRequests.map((x) => (x.id === id ? cr : x));
    const k = cr.content;
    const live = <T,>(xs: T[], old: T[], same: (a: T, b: T) => boolean, price: (x: T) => Partial<T>) => xs.map((x) => { const o = old.find((y) => same(x, y)); return o ? { ...x, ...price(o) } : x; });
    // Approval keeps the live prices of what the product already has; new sizes and options take the request's.
    const sizes = live(k.sizes, p.sizes, (a, b) => a.id === b.id, (o) => ({ priceHalalas: o.priceHalalas }));
    const category = mock.items.categories.find((x) => x.id === k.categoryId)!;
    const meat = k.meatTypeId ? mock.items['meat-types'].find((x) => x.id === k.meatTypeId) : null;
    const next: Product = {
      ...p, name: k.name, description: k.description, category: ref(category), meatType: meat ? ref(meat) : null, images: k.images, sizes,
      cuttings: live(k.cuttings, p.cuttings, (a, b) => a.cuttingStyleId === b.cuttingStyleId, (o) => ({ extraPriceHalalas: o.extraPriceHalalas }))
        .map((c) => ({ ...c, name: mock.items['cutting-styles'].find((x) => x.id === c.cuttingStyleId)?.name ?? null })),
      packagings: live(k.packagings, p.packagings, (a, b) => a.packaging === b.packaging, (o) => ({ extraPriceHalalas: o.extraPriceHalalas })),
      exclusions: k.exclusionItemIds.map((x) => ref(mock.items['exclusion-items'].find((e) => e.id === x)!)),
      minPriceHalalas: sizes.length ? Math.min(...sizes.map((s) => s.priceHalalas)) : null, changeRequest: cr, updatedAt: now,
    };
    mock.products.set(p.id, next);
    return { ok: true, data: next };
  },
  async rejectChange(token, _l, id, reason) {
    if (limited(token)) return forbidden;
    const c = openChange(id);
    if (!c.ok) return c;
    const now = new Date().toISOString();
    const cr: ChangeRequest = { ...c.data, status: 'rejected', rejectionReason: reason.trim(), updatedAt: now, reviewedAt: now };
    mock.changeRequests = mock.changeRequests.map((x) => (x.id === id ? cr : x));
    const p = mock.products.get(cr.productId)!;
    mock.products.set(p.id, { ...p, changeRequest: cr });
    return { ok: true, data: null, status: 204 };
  },
};

/** An admin's decision on a product under review (approve, reject): PRODUCT_NOT_EDITABLE once decided. */
function decide(token: string, id: string, change: () => Partial<Product>): ApiResult<Product> {
  if (limited(token)) return forbidden;
  const p = mock.products.get(id);
  if (!p) return notFound;
  if (p.status !== 'pending_review') return { ok: false, code: 'PRODUCT_NOT_EDITABLE', status: 409, details: { status: p.status } };
  const now = new Date().toISOString();
  const next: Product = { ...p, ...change(), reviewedAt: now, updatedAt: now };
  mock.products.set(id, next);
  return { ok: true, data: next };
}

/** A pending change request, or the API's refusal: superseded (the vendor edited again), or decided (NOT_FOUND). */
function openChange(id: string): ApiResult<ChangeRequest> {
  const c = mock.changeRequests.find((x) => x.id === id);
  if (!c || c.status === 'approved' || c.status === 'rejected') return notFound;
  if (c.status === 'superseded') return { ok: false, code: 'PRODUCT_CHANGE_REQUEST_SUPERSEDED', status: 409 };
  return { ok: true, data: c };
}

/** PATCH …/prices on the mock: the named sizes, cuttings and packagings take their new prices. */
export function newPrices(p: Product, body: Prices): ApiResult<Product> | Partial<Product> {
  const sizes = p.sizes.map((s) => ({ ...s }));
  for (const [i, x] of (body.sizes ?? []).entries()) {
    const s = sizes.find((y) => y.id === x.sizeId);
    if (!s) return invalid(`sizes.${i}.sizeId`, 'isSizeOfProduct');
    s.priceHalalas = x.priceHalalas;
  }
  const cuttings = p.cuttings.map((c) => ({ ...c }));
  for (const [i, x] of (body.cuttings ?? []).entries()) {
    const c = cuttings.find((y) => y.cuttingStyleId === x.cuttingStyleId);
    if (!c) return invalid(`cuttings.${i}.cuttingStyleId`, 'isCuttingOfProduct');
    c.extraPriceHalalas = x.extraPriceHalalas;
  }
  const packagings = p.packagings.map((k) => ({ ...k }));
  for (const [i, x] of (body.packagings ?? []).entries()) {
    const k = packagings.find((y) => y.packaging === x.packaging);
    if (!k) return invalid(`packagings.${i}.packaging`, 'isPackagingOfProduct');
    k.extraPriceHalalas = x.extraPriceHalalas;
  }
  return { sizes, cuttings, packagings, minPriceHalalas: sizes.length ? Math.min(...sizes.map((s) => s.priceHalalas)) : null };
}
