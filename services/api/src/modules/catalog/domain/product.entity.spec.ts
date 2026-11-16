import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import { Product } from './product.entity';
import type { ProductContent } from './product-content.type';
import type { ProductDetails } from './product-details.type';

const CUT = '00000000-0000-4000-8000-0000000000c1';
const OTHER_CUT = '00000000-0000-4000-8000-0000000000c2';
const SIZE = '00000000-0000-4000-8000-0000000000a1';

const CONTENT: ProductContent = {
  name: { ar: 'نعيمي', en: 'Naimi lamb' },
  description: { ar: null, en: null },
  categoryId: '00000000-0000-4000-8000-0000000000b1',
  meatTypeId: null,
  imageMediaIds: ['00000000-0000-4000-8000-0000000000d1'],
  sizes: [
    { id: null, approxWeightGrams: 8_000, price: Money.of(95_000), tag: null },
  ],
  cuttings: [{ cuttingStyleId: CUT, extraPrice: Money.zero() }],
  packagings: ['trays', 'vacuum'],
  exclusionItemIds: [],
};

const LIVE: ProductDetails = {
  id: '00000000-0000-4000-8000-0000000000e1',
  vendorId: '00000000-0000-4000-8000-0000000000f1',
  status: 'published',
  isAvailable: true,
  fulfilment: 'both',
  name: CONTENT.name,
  description: CONTENT.description,
  category: { id: CONTENT.categoryId, name: { ar: 'ذبائح', en: 'Whole' } },
  meatType: null,
  imageMediaIds: CONTENT.imageMediaIds,
  sizes: [
    {
      id: SIZE,
      approxWeightGrams: 8_000,
      price: Money.of(95_000),
      tag: { ar: 'يجزئ العقيقة', en: 'Enough for an aqiqah' },
    },
  ],
  cuttings: [
    {
      cuttingStyleId: CUT,
      name: { ar: 'ثلاجة', en: 'Fridge cut' },
      extraPrice: Money.of(1_500),
    },
  ],
  packagings: ['trays'],
  exclusions: [],
  minPrice: Money.of(95_000),
  rejectionReason: null,
  submittedAt: null,
  reviewedAt: null,
  publishedAt: null,
  createdAt: new Date('2026-11-16T09:00:00.000Z'),
  updatedAt: new Date('2026-11-16T09:00:00.000Z'),
};

const errorOf = (work: () => void): unknown => {
  try {
    work();
    return null;
  } catch (error) {
    return error;
  }
};

describe('Product', () => {
  describe('assertSubmittable', () => {
    it('accepts a size, an image and compatible options', () => {
      expect(
        errorOf(() =>
          Product.assertSubmittable(CONTENT, [
            { cuttingStyleId: OTHER_CUT, packaging: 'vacuum' },
            { cuttingStyleId: CUT, packaging: 'bags' },
          ]),
        ),
      ).toBeNull();
    });

    it('refuses no size and no image, both reasons at once', () => {
      expect(
        errorOf(() =>
          Product.assertSubmittable(
            { ...CONTENT, sizes: [], imageMediaIds: [] },
            [],
          ),
        ),
      ).toMatchObject({
        code: ErrorCode.PRODUCT_NOT_SUBMITTABLE,
        details: { reasons: ['NO_SIZE', 'NO_IMAGE'] },
      });
    });

    it('refuses an offered cutting with an offered packaging it is incompatible with, naming the pair', () => {
      expect(
        errorOf(() =>
          Product.assertSubmittable(CONTENT, [
            { cuttingStyleId: CUT, packaging: 'vacuum' },
          ]),
        ),
      ).toMatchObject({
        code: ErrorCode.PRODUCT_NOT_SUBMITTABLE,
        details: {
          reasons: ['INCOMPATIBLE_CUTTING_PACKAGING'],
          pairs: [{ cuttingStyleId: CUT, packaging: 'vacuum' }],
        },
      });
    });
  });

  describe('assertOwnSizes', () => {
    it("accepts new sizes and the product's own, refuses another size id", () => {
      const own = { ...CONTENT.sizes[0], id: SIZE };
      const foreign = { ...CONTENT.sizes[0], id: CUT };

      expect(
        errorOf(() =>
          Product.assertOwnSizes(
            { ...CONTENT, sizes: [...CONTENT.sizes, own] },
            LIVE,
          ),
        ),
      ).toBeNull();
      expect(
        errorOf(() =>
          Product.assertOwnSizes({ ...CONTENT, sizes: [own, foreign] }, LIVE),
        ),
      ).toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
        details: [{ field: 'sizes.1.id', constraints: ['isSizeOfProduct'] }],
      });
      expect(
        errorOf(() =>
          Product.assertOwnSizes({ ...CONTENT, sizes: [own] }, null),
        ),
      ).toMatchObject({ details: [{ field: 'sizes.0.id' }] });
    });
  });

  describe('assertNoRepeats', () => {
    it('accepts distinct ids and several new sizes', () => {
      const newSize = CONTENT.sizes[0];
      expect(
        errorOf(() =>
          Product.assertNoRepeats({
            ...CONTENT,
            sizes: [{ ...newSize, id: SIZE }, newSize, newSize],
            cuttings: [
              { cuttingStyleId: CUT, extraPrice: Money.zero() },
              { cuttingStyleId: OTHER_CUT, extraPrice: Money.zero() },
            ],
          }),
        ),
      ).toBeNull();
    });

    it('refuses a size id or a cutting style named twice, on each repeat', () => {
      const own = { ...CONTENT.sizes[0], id: SIZE };
      expect(
        errorOf(() =>
          Product.assertNoRepeats({
            ...CONTENT,
            sizes: [own, { ...own, price: Money.of(1) }],
            cuttings: [
              { cuttingStyleId: CUT, extraPrice: Money.zero() },
              { cuttingStyleId: OTHER_CUT, extraPrice: Money.zero() },
              { cuttingStyleId: CUT, extraPrice: Money.of(1) },
            ],
          }),
        ),
      ).toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
        details: [
          { field: 'sizes.1.id', constraints: ['isNotRepeated'] },
          {
            field: 'cuttings.2.cuttingStyleId',
            constraints: ['isNotRepeated'],
          },
        ],
      });
    });
  });

  describe('assertNoRepeatedPriceChanges', () => {
    it('accepts each size and cutting style once', () => {
      expect(
        errorOf(() =>
          Product.assertNoRepeatedPriceChanges({
            sizes: [{ sizeId: SIZE, price: Money.of(1) }],
            cuttings: [
              { cuttingStyleId: CUT, extraPrice: Money.zero() },
              { cuttingStyleId: OTHER_CUT, extraPrice: Money.zero() },
            ],
          }),
        ),
      ).toBeNull();
    });

    it('refuses a size or a cutting style named twice, on each repeat', () => {
      expect(
        errorOf(() =>
          Product.assertNoRepeatedPriceChanges({
            sizes: [
              { sizeId: SIZE, price: Money.of(1) },
              { sizeId: SIZE, price: Money.of(2) },
            ],
            cuttings: [
              { cuttingStyleId: CUT, extraPrice: Money.zero() },
              { cuttingStyleId: CUT, extraPrice: Money.of(1) },
            ],
          }),
        ),
      ).toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
        details: [
          { field: 'sizes.1.sizeId', constraints: ['isNotRepeated'] },
          {
            field: 'cuttings.1.cuttingStyleId',
            constraints: ['isNotRepeated'],
          },
        ],
      });
    });
  });

  describe('editing a published product', () => {
    it('accepts a content edit that keeps the live prices and adds a priced size', () => {
      const content: ProductContent = {
        ...Product.contentOf(LIVE),
        name: { ar: 'نعيمي بلدي', en: 'Local Naimi' },
        sizes: [
          ...Product.contentOf(LIVE).sizes,
          {
            id: null,
            approxWeightGrams: 12_000,
            price: Money.of(130_000),
            tag: null,
          },
        ],
      };

      expect(
        errorOf(() => Product.assertKeepsLivePrices(content, LIVE)),
      ).toBeNull();
    });

    it('refuses a changed price of an existing size or cutting style', () => {
      const live = Product.contentOf(LIVE);
      const content: ProductContent = {
        ...live,
        sizes: [{ ...live.sizes[0], price: Money.of(90_000) }],
        cuttings: [{ cuttingStyleId: CUT, extraPrice: Money.zero() }],
      };

      expect(
        errorOf(() => Product.assertKeepsLivePrices(content, LIVE)),
      ).toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
        details: [
          { field: 'sizes.0.priceHalalas', constraints: ['isLivePrice'] },
          {
            field: 'cuttings.0.extraPriceHalalas',
            constraints: ['isLivePrice'],
          },
        ],
      });
    });
  });
});
