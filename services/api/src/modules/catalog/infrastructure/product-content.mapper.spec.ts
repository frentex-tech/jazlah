import { Money } from '@common/money/money';
import type { ProductContent } from '../domain/product-content.type';
import {
  toProductContent,
  toStoredProductContent,
} from './product-content.mapper';

const CONTENT: ProductContent = {
  name: { ar: 'نعيمي', en: 'Naimi lamb' },
  description: { ar: null, en: 'Fresh' },
  categoryId: 'c1',
  meatTypeId: null,
  imageMediaIds: ['m1', 'm2'],
  sizes: [
    {
      id: 's1',
      approxWeightGrams: 8_000,
      price: Money.of(95_000),
      tag: { ar: 'يجزئ العقيقة', en: 'Enough for an aqiqah' },
    },
    { id: null, approxWeightGrams: 4_000, price: Money.of(1), tag: null },
  ],
  cuttings: [{ cuttingStyleId: 'k1', extraPrice: Money.zero() }],
  packagings: [
    { packaging: 'trays', extraPrice: Money.of(250) },
    { packaging: 'none', extraPrice: Money.zero() },
  ],
  exclusionItemIds: ['e1'],
};

describe('product content mapper', () => {
  it('stores amounts as whole halalas and reads the same content back through JSON', () => {
    const stored = toStoredProductContent(CONTENT);
    const json: unknown = JSON.parse(JSON.stringify(stored));

    expect(stored.sizes.map((size) => size.priceHalalas)).toEqual([95_000, 1]);
    const read = toProductContent(json);
    expect(read.sizes.map((size) => size.price.halalas)).toEqual([95_000, 1]);
    expect({ ...read, sizes: [], cuttings: [] }).toEqual({
      ...CONTENT,
      sizes: [],
      cuttings: [],
    });
    expect(read.cuttings[0]?.extraPrice.halalas).toBe(0);
    expect(stored.packagings).toEqual([
      { packaging: 'trays', extraPriceHalalas: 250 },
      { packaging: 'none', extraPriceHalalas: 0 },
    ]);
    expect(read.packagings.map((option) => option.extraPrice.halalas)).toEqual([
      250, 0,
    ]);
  });

  it('reads a request stored before packagings had prices as price 0', () => {
    const read = toProductContent({
      ...toStoredProductContent(CONTENT),
      packagings: ['trays', 'vacuum'],
    });

    expect(
      read.packagings.map((option) => [
        option.packaging,
        option.extraPrice.halalas,
      ]),
    ).toEqual([
      ['trays', 0],
      ['vacuum', 0],
    ]);
  });

  it('refuses a stored row that does not match', () => {
    expect(() =>
      toProductContent({
        ...toStoredProductContent(CONTENT),
        packagings: ['box'],
      }),
    ).toThrow();
    expect(() => toProductContent(null)).toThrow();
  });
});
