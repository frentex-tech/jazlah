import { halalasOf, sarInput } from '../../../lib/money.ts'; // relative: the unit test runs under plain node
import type { Fulfilment, Packaging, Product, ProductContent, ProductContentResponse } from '../types';

/** What the form edits; amounts as typed (SAR), turned into the API's content on submit. */
export type SizeRow = { key: string; id: string | null; tagAr: string; tagEn: string; grams: string; price: string };
export type FormState = {
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  categoryId: string;
  meatTypeId: string;
  images: { mediaId: string; url: string | null }[];
  sizes: SizeRow[];
  cuts: { id: string; price: string }[];
  packs: { packaging: Packaging; price: string }[];
  exclusions: string[];
  delivery: boolean;
  pickup: boolean;
  available: boolean;
};
export type ProductFormValues = { content: ProductContent; fulfilment: Fulfilment; isAvailable: boolean };
/** Field errors keyed by the API's field paths (`name.ar`, `sizes.2.priceHalalas`, …), as VALIDATION_FAILED names them. */
export type Errors = Record<string, string>;

/** The API's highest price, in halalas (1,000,000.00 SAR). */
const MAX_HALALAS = 100_000_000;

let seq = 0;
export const rowKey = () => `row-${++seq}`;
export const emptySize = (): SizeRow => ({ key: rowKey(), id: null, tagAr: '', tagEn: '', grams: '', price: '' });

/** The live content of a product (or a draft's), as a change request holds it. */
export const liveContent = (p: Product): ProductContentResponse => ({
  name: p.name, description: p.description, categoryId: p.category.id, meatTypeId: p.meatType?.id ?? null, images: p.images, sizes: p.sizes,
  cuttings: p.cuttings, packagings: p.packagings, exclusionItemIds: p.exclusions.map((x) => x.id),
});

/**
 * What the form edits: on a published product with a pending change request, the vendor's proposed content (so a saved
 * edit does not snap back to the live one), with the live prices of what the product already has (approval keeps them).
 */
export function editedContent(p: Product): ProductContentResponse {
  const c = p.status === 'published' && p.changeRequest?.status === 'pending' ? p.changeRequest.content : null;
  if (!c) return liveContent(p);
  return {
    ...c,
    sizes: c.sizes.map((s) => ({ ...s, priceHalalas: p.sizes.find((x) => x.id === s.id)?.priceHalalas ?? s.priceHalalas })),
    cuttings: c.cuttings.map((k) => ({ ...k, extraPriceHalalas: p.cuttings.find((x) => x.cuttingStyleId === k.cuttingStyleId)?.extraPriceHalalas ?? k.extraPriceHalalas })),
    packagings: c.packagings.map((k) => ({ ...k, extraPriceHalalas: p.packagings.find((x) => x.packaging === k.packaging)?.extraPriceHalalas ?? k.extraPriceHalalas })),
  };
}

/** A content as the API's body (ProductContentDto). */
export const bodyOf = (c: ProductContentResponse): ProductContent => ({
  name: c.name, description: c.description, categoryId: c.categoryId, meatTypeId: c.meatTypeId, imageMediaIds: c.images.map((i) => i.mediaId),
  sizes: c.sizes.map((s) => ({ id: s.id, approxWeightGrams: s.approxWeightGrams, priceHalalas: s.priceHalalas, tag: s.tag })),
  cuttings: c.cuttings.map((k) => ({ cuttingStyleId: k.cuttingStyleId, extraPriceHalalas: k.extraPriceHalalas })),
  packagings: c.packagings.map((k) => ({ packaging: k.packaging, extraPriceHalalas: k.extraPriceHalalas })),
  exclusionItemIds: c.exclusionItemIds,
});

/**
 * Whether two contents differ in what a published product's review covers: everything but the prices of the sizes,
 * cuttings and packagings `p` already has (those change at once through PATCH …/prices). New ones' prices count.
 */
export function differsForReview(p: Product, a: ProductContent, b: ProductContent): boolean {
  const key = (c: ProductContent) =>
    JSON.stringify([
      c.name.ar, c.name.en, c.description?.ar || null, c.description?.en || null, c.categoryId, c.meatTypeId || null, c.imageMediaIds, c.exclusionItemIds,
      c.sizes.map((s) => [s.id ?? null, s.approxWeightGrams, s.tag?.ar ?? null, s.tag?.en ?? null, s.id && p.sizes.some((x) => x.id === s.id) ? 0 : s.priceHalalas]),
      c.cuttings.map((k) => [k.cuttingStyleId, p.cuttings.some((x) => x.cuttingStyleId === k.cuttingStyleId) ? 0 : k.extraPriceHalalas]),
      c.packagings.map((k) => [k.packaging, p.packagings.some((x) => x.packaging === k.packaging) ? 0 : k.extraPriceHalalas]),
    ]);
  return key(a) !== key(b);
}

/** The form's state of a product; `preferPending`: open on the pending change request's content (vendors). */
export function stateOf(p: Product | null, preferPending = false): FormState {
  if (!p) {
    return {
      nameAr: '', nameEn: '', descAr: '', descEn: '', categoryId: '', meatTypeId: '', images: [], sizes: [], cuts: [], packs: [], exclusions: [],
      delivery: true, pickup: true, available: true,
    };
  }
  const c = preferPending ? editedContent(p) : liveContent(p);
  return {
    nameAr: c.name.ar, nameEn: c.name.en, descAr: c.description.ar ?? '', descEn: c.description.en ?? '', categoryId: c.categoryId, meatTypeId: c.meatTypeId ?? '',
    images: c.images.map((i) => ({ mediaId: i.mediaId, url: i.url })),
    sizes: c.sizes.map((s) => ({ key: rowKey(), id: s.id, tagAr: s.tag?.ar ?? '', tagEn: s.tag?.en ?? '', grams: String(s.approxWeightGrams), price: sarInput(s.priceHalalas) })),
    cuts: c.cuttings.map((k) => ({ id: k.cuttingStyleId, price: sarInput(k.extraPriceHalalas) })),
    packs: c.packagings.map((k) => ({ packaging: k.packaging, price: sarInput(k.extraPriceHalalas) })),
    exclusions: c.exclusionItemIds,
    delivery: p.fulfilment !== 'pickup', pickup: p.fulfilment !== 'delivery', available: p.isAvailable,
  };
}

const grams = (s: string) => {
  const n = Number(s.trim().replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))));
  return Number.isInteger(n) && n >= 1 && n <= 10_000_000 ? n : null;
};

/**
 * The form's own checks (what the frames show: required name, prices, …) and the API body. The API checks the rest
 * (lengths, active references, live prices) and its VALIDATION_FAILED paths land on the same keys.
 */
export function toValues(s: FormState): { values: ProductFormValues; errors: Errors } {
  const errors: Errors = {};
  if (!s.nameAr.trim()) errors['name.ar'] = 'required';
  if (!s.nameEn.trim()) errors['name.en'] = 'required';
  if (!s.categoryId) errors.categoryId = 'required';
  if (!s.delivery && !s.pickup) errors.fulfilment = 'required';
  const sizes = s.sizes.map((r, i) => {
    const price = halalasOf(r.price);
    const g = grams(r.grams);
    if (!r.price.trim()) errors[`sizes.${i}.priceHalalas`] = 'required';
    else if (price === null || price < 1 || price > MAX_HALALAS) errors[`sizes.${i}.priceHalalas`] = 'invalid';
    if (!r.grams.trim()) errors[`sizes.${i}.approxWeightGrams`] = 'required';
    else if (g === null) errors[`sizes.${i}.approxWeightGrams`] = 'invalid';
    // A tag is both languages or none (the API's LocalizedNameDto).
    if (!!r.tagAr.trim() !== !!r.tagEn.trim()) errors[`sizes.${i}.tag.${r.tagAr.trim() ? 'en' : 'ar'}`] = 'required';
    return {
      ...(r.id && { id: r.id }),
      approxWeightGrams: g ?? 0,
      priceHalalas: price ?? 0,
      tag: r.tagAr.trim() && r.tagEn.trim() ? { ar: r.tagAr.trim(), en: r.tagEn.trim() } : null,
    };
  });
  const extra = (price: string, key: string) => {
    const h = price.trim() ? halalasOf(price) : 0;
    if (h === null || h > MAX_HALALAS) errors[key] = 'invalid';
    return h ?? 0;
  };
  const content: ProductContent = {
    name: { ar: s.nameAr.trim(), en: s.nameEn.trim() },
    description: { ar: s.descAr.trim() || null, en: s.descEn.trim() || null },
    categoryId: s.categoryId,
    meatTypeId: s.meatTypeId || null,
    imageMediaIds: s.images.map((i) => i.mediaId),
    sizes,
    cuttings: s.cuts.map((c, i) => ({ cuttingStyleId: c.id, extraPriceHalalas: extra(c.price, `cuttings.${i}.extraPriceHalalas`) })),
    packagings: s.packs.map((k, i) => ({ packaging: k.packaging, extraPriceHalalas: extra(k.price, `packagings.${i}.extraPriceHalalas`) })),
    exclusionItemIds: s.exclusions,
  };
  const fulfilment: Fulfilment = s.delivery && s.pickup ? 'both' : s.pickup ? 'pickup' : 'delivery';
  return { values: { content, fulfilment, isAvailable: s.available }, errors };
}

/**
 * Price changes of what the product already has (PATCH …/prices), and the content with those new prices: a content
 * edit must carry the live prices (`isLivePrice`), so prices go first. `rows` maps each PATCH item back to its index
 * in the content (the form's row), so a refusal of `sizes.0` lands on the right row.
 */
export function priceChanges(p: Product, c: ProductContent) {
  const rows = { sizes: [] as number[], cuttings: [] as number[], packagings: [] as number[] };
  const sizes: { sizeId: string; priceHalalas: number }[] = [];
  c.sizes.forEach((s, i) => {
    const old = s.id ? p.sizes.find((x) => x.id === s.id) : undefined;
    if (old && old.priceHalalas !== s.priceHalalas) {
      sizes.push({ sizeId: old.id!, priceHalalas: s.priceHalalas });
      rows.sizes.push(i);
    }
  });
  const cuttings = c.cuttings.filter((x, i) => {
    const old = p.cuttings.find((y) => y.cuttingStyleId === x.cuttingStyleId);
    const changed = !!old && old.extraPriceHalalas !== x.extraPriceHalalas;
    if (changed) rows.cuttings.push(i);
    return changed;
  });
  const packagings = c.packagings.filter((x, i) => {
    const old = p.packagings.find((y) => y.packaging === x.packaging);
    const changed = !!old && old.extraPriceHalalas !== x.extraPriceHalalas;
    if (changed) rows.packagings.push(i);
    return changed;
  });
  return sizes.length || cuttings.length || packagings.length ? { body: { sizes, cuttings, packagings }, rows } : null;
}

/** A PATCH …/prices field (`sizes.0.priceHalalas`, `cuttings.1.cuttingStyleId`) as the form's field of that row. */
export function priceField(field: string, rows: { sizes: number[]; cuttings: number[]; packagings: number[] }): string {
  const m = /^(sizes|cuttings|packagings)\.(\d+)\.(.+)$/.exec(field);
  if (!m) return field;
  const [, list, j, leaf] = m as unknown as [string, keyof typeof rows, string, string];
  const row = rows[list][Number(j)];
  const price = list === 'sizes' ? 'priceHalalas' : 'extraPriceHalalas';
  return row === undefined ? field : `${list}.${row}.${leaf === 'sizeId' || leaf === 'cuttingStyleId' || leaf === 'packaging' ? price : leaf}`;
}
