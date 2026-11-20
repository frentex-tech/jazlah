import { halalasOf, sarInput } from '../../../lib/money.ts'; // relative: the unit test runs under plain node
import type { Fulfilment, Packaging, Product, ProductContent } from '../types';

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

let seq = 0;
export const rowKey = () => `row-${++seq}`;
export const emptySize = (): SizeRow => ({ key: rowKey(), id: null, tagAr: '', tagEn: '', grams: '', price: '' });

export function stateOf(p: Product | null): FormState {
  if (!p) {
    return {
      nameAr: '', nameEn: '', descAr: '', descEn: '', categoryId: '', meatTypeId: '', images: [], sizes: [], cuts: [], packs: [], exclusions: [],
      delivery: true, pickup: true, available: true,
    };
  }
  return {
    nameAr: p.name.ar, nameEn: p.name.en, descAr: p.description.ar ?? '', descEn: p.description.en ?? '', categoryId: p.category.id, meatTypeId: p.meatType?.id ?? '',
    images: p.images.map((i) => ({ mediaId: i.mediaId, url: i.url })),
    sizes: p.sizes.map((s) => ({ key: rowKey(), id: s.id, tagAr: s.tag?.ar ?? '', tagEn: s.tag?.en ?? '', grams: String(s.approxWeightGrams), price: sarInput(s.priceHalalas) })),
    cuts: p.cuttings.map((c) => ({ id: c.cuttingStyleId, price: sarInput(c.extraPriceHalalas) })),
    packs: p.packagings.map((k) => ({ packaging: k.packaging, price: sarInput(k.extraPriceHalalas) })),
    exclusions: p.exclusions.map((x) => x.id),
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
    else if (price === null || price < 1) errors[`sizes.${i}.priceHalalas`] = 'invalid';
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
    if (h === null) errors[key] = 'invalid';
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
 * edit must carry the live prices (`isLivePrice`), so prices go first.
 */
export function priceChanges(p: Product, c: ProductContent) {
  const sizes = c.sizes.flatMap((s) => {
    const old = s.id ? p.sizes.find((x) => x.id === s.id) : undefined;
    return old && old.priceHalalas !== s.priceHalalas ? [{ sizeId: old.id!, priceHalalas: s.priceHalalas }] : [];
  });
  const cuttings = c.cuttings.filter((x) => {
    const old = p.cuttings.find((y) => y.cuttingStyleId === x.cuttingStyleId);
    return old && old.extraPriceHalalas !== x.extraPriceHalalas;
  });
  const packagings = c.packagings.filter((x) => {
    const old = p.packagings.find((y) => y.packaging === x.packaging);
    return old && old.extraPriceHalalas !== x.extraPriceHalalas;
  });
  return sizes.length || cuttings.length || packagings.length ? { sizes, cuttings, packagings } : null;
}
