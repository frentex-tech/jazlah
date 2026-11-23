import { Money } from '@common/money/money';
import { priceLine } from './price-line';
import type { LineSelection } from './line-selection.type';
import type { PriceableProduct } from './priceable-product.type';

// Every branch on its own; the shared cases (docs/frontend/fixtures/pricing-cases.json)
// run in application/pricing.service.spec.ts, since domain code reads no file (R8).
const PRODUCT: PriceableProduct = {
  isAvailable: true,
  sizes: [
    {
      id: 'small',
      approxWeightGrams: 500,
      price: Money.of(4_950),
      tag: null,
      isAvailable: true,
    },
    {
      id: 'large',
      approxWeightGrams: 2_000,
      price: Money.of(17_200),
      tag: null,
      isAvailable: false,
    },
  ],
  cuttings: [
    {
      cuttingStyleId: 'cubes',
      name: { ar: 'مكعبات', en: 'Cubes' },
      extraPrice: Money.of(200),
    },
  ],
  packagings: [{ packaging: 'vacuum', extraPrice: Money.of(500) }],
  exclusions: [{ id: 'fat', name: { ar: 'بدون شحم', en: 'No fat' } }],
  incompatiblePairs: [],
};

const SELECTION: LineSelection = {
  sizeId: 'small',
  cuttingStyleId: 'cubes',
  packaging: 'vacuum',
  exclusionItemIds: ['fat'],
  quantity: 3,
};

describe('priceLine', () => {
  it('adds the size, cutting and packaging, then multiplies by the quantity', () => {
    const line = priceLine(PRODUCT, SELECTION);

    expect(line.unitPrice.halalas).toBe(5_650);
    expect(line.lineTotal.halalas).toBe(16_950);
    expect(
      line.breakdown.map((part) => [
        part.kind,
        part.optionId,
        part.amount.halalas,
      ]),
    ).toEqual([
      ['size', 'small', 4_950],
      ['cutting', 'cubes', 200],
      ['packaging', 'vacuum', 500],
    ]);
    expect(line.errors).toEqual([]);
  });

  it('prices a size alone on a product without cutting styles', () => {
    const line = priceLine(
      { ...PRODUCT, cuttings: [] },
      { ...SELECTION, cuttingStyleId: null, packaging: null, quantity: 1 },
    );

    expect(line.unitPrice.halalas).toBe(4_950);
    expect(line.errors).toEqual([]);
  });

  it('keeps the price but flags OPTION_REQUIRED when cutting styles exist and none is chosen', () => {
    const line = priceLine(PRODUCT, { ...SELECTION, cuttingStyleId: null });

    expect(line.unitPrice.halalas).toBe(5_450);
    expect(line.errors).toEqual(['OPTION_REQUIRED']);
  });

  it.each([
    [
      'a switched-off product',
      { ...PRODUCT, isAvailable: false },
      SELECTION,
      ['PRODUCT_UNAVAILABLE'],
    ],
    [
      'an unknown size',
      PRODUCT,
      { ...SELECTION, sizeId: 'huge' },
      ['OPTION_NOT_IN_PRODUCT'],
    ],
    [
      'a switched-off size',
      PRODUCT,
      { ...SELECTION, sizeId: 'large' },
      ['SIZE_UNAVAILABLE'],
    ],
    [
      'an unknown cutting style',
      PRODUCT,
      { ...SELECTION, cuttingStyleId: 'mince' },
      ['OPTION_NOT_IN_PRODUCT'],
    ],
    [
      'an unknown packaging',
      PRODUCT,
      { ...SELECTION, packaging: 'trays' as const },
      ['OPTION_NOT_IN_PRODUCT'],
    ],
    [
      'an unknown "without" item',
      PRODUCT,
      { ...SELECTION, exclusionItemIds: ['bone'] },
      ['OPTION_NOT_IN_PRODUCT'],
    ],
    [
      'a forbidden pair',
      {
        ...PRODUCT,
        incompatiblePairs: [
          { cuttingStyleId: 'cubes', packaging: 'vacuum' as const },
        ],
      },
      SELECTION,
      ['INCOMPATIBLE_CUTTING_PACKAGING'],
    ],
    [
      'no cutting with another error: OPTION_REQUIRED is not added',
      PRODUCT,
      { ...SELECTION, sizeId: 'large', cuttingStyleId: null },
      ['SIZE_UNAVAILABLE'],
    ],
  ] as const)('zeroes the line for %s', (_name, product, selection, errors) => {
    const line = priceLine(product, selection);

    expect(line.unitPrice.equals(Money.zero())).toBe(true);
    expect(line.lineTotal.equals(Money.zero())).toBe(true);
    expect(line.breakdown).toEqual([]);
    expect(line.errors).toEqual(errors);
  });

  it('lists each error once, in the order checked', () => {
    const line = priceLine(
      {
        ...PRODUCT,
        isAvailable: false,
        incompatiblePairs: [{ cuttingStyleId: 'mince', packaging: 'trays' }],
      },
      {
        ...SELECTION,
        sizeId: 'large',
        cuttingStyleId: 'mince',
        packaging: 'trays',
        exclusionItemIds: ['bone'],
      },
    );

    expect(line.errors).toEqual([
      'PRODUCT_UNAVAILABLE',
      'SIZE_UNAVAILABLE',
      'OPTION_NOT_IN_PRODUCT',
      'INCOMPATIBLE_CUTTING_PACKAGING',
    ]);
  });
});
