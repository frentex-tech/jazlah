import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Money } from '@common/money/money';
import { InMemoryCatalogMedia } from '../domain/fakes/in-memory-catalog-media.fake';
import { InMemoryCatalogVendors } from '../domain/fakes/in-memory-catalog-vendors.fake';
import { InMemoryCuttingPackagingIncompatibilities } from '../domain/fakes/in-memory-cutting-packaging-incompatibilities.fake';
import type { ProductRepository } from '../domain/ports/product.repository.port';
import type { ProductDetails } from '../domain/product-details.type';
import type { ProductPackaging } from '../domain/product-packaging.type';
import { PricingService } from './pricing.service';

/** The shared cases, read by the apps' tests too (docs/frontend/fixtures/). */
type FixtureProduct = {
  isAvailable: boolean;
  sizes: { id: string; priceHalalas: number; isAvailable: boolean }[];
  cuttings: { cuttingStyleId: string; extraPriceHalalas: number }[];
  packagings: { packaging: ProductPackaging; extraPriceHalalas: number }[];
  exclusions: { id: string }[];
  incompatiblePairs: { cuttingStyleId: string; packaging: ProductPackaging }[];
};
type Fixture = {
  products: Record<string, FixtureProduct>;
  cases: {
    name: string;
    product: string;
    selection: {
      sizeId: string;
      cuttingStyleId: string | null;
      packaging: ProductPackaging | null;
      exclusionItemIds: string[];
      quantity: number;
    };
    expected: {
      unitPriceHalalas: number;
      lineTotalHalalas: number;
      breakdown: { kind: string; optionId: string; halalas: number }[];
      errors: string[];
    };
  }[];
};

const FIXTURE = JSON.parse(
  readFileSync(
    join(
      __dirname,
      ...Array<string>(6).fill('..'),
      'docs/frontend/fixtures/pricing-cases.json',
    ),
    'utf8',
  ),
) as Fixture;

/** A live product with the fixture's options; the rest is filler pricing never reads. */
function details(id: string, product: FixtureProduct): ProductDetails {
  return {
    id,
    vendorId: id,
    status: 'published',
    isAvailable: product.isAvailable,
    fulfilment: 'both',
    name: { ar: id, en: id },
    description: { ar: null, en: null },
    category: { id, name: { ar: id, en: id } },
    meatType: null,
    imageMediaIds: [],
    sizes: product.sizes.map((size) => ({
      id: size.id,
      approxWeightGrams: 1000,
      price: Money.of(size.priceHalalas),
      tag: null,
      isAvailable: size.isAvailable,
    })),
    cuttings: product.cuttings.map((cutting) => ({
      cuttingStyleId: cutting.cuttingStyleId,
      name: { ar: cutting.cuttingStyleId, en: cutting.cuttingStyleId },
      extraPrice: Money.of(cutting.extraPriceHalalas),
    })),
    packagings: product.packagings.map((option) => ({
      packaging: option.packaging,
      extraPrice: Money.of(option.extraPriceHalalas),
    })),
    exclusions: product.exclusions.map((item) => ({
      id: item.id,
      name: { ar: item.id, en: item.id },
    })),
    minPrice: Money.min(product.sizes.map((s) => Money.of(s.priceHalalas))),
    rejectionReason: null,
    submittedAt: null,
    reviewedAt: null,
    publishedAt: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

/** The public products by id: a partial double of the one method pricing reads. */
function publicProducts(
  products: ReadonlyMap<string, ProductDetails>,
): ProductRepository {
  return {
    findPublic: (id: string) => Promise.resolve(products.get(id) ?? null),
  } as unknown as ProductRepository;
}

async function serviceFor(key: string): Promise<PricingService> {
  const product = FIXTURE.products[key];
  if (product === undefined) {
    throw new Error(`No fixture product ${key}`);
  }
  const rules = new InMemoryCuttingPackagingIncompatibilities();
  for (const pair of product.incompatiblePairs) {
    await rules.create(pair.cuttingStyleId, pair.packaging);
  }
  return new PricingService(
    publicProducts(new Map([[key, details(key, product)]])),
    rules,
    new InMemoryCatalogMedia(),
    new InMemoryCatalogVendors(),
  );
}

describe('PricingService', () => {
  it('reads every case of the shared fixture', () => {
    expect(FIXTURE.cases.length).toBeGreaterThanOrEqual(20);
  });

  describe.each(FIXTURE.cases.map((c) => [c.name, c] as const))(
    'shared case: %s',
    (_name, fixtureCase) => {
      it('prices exactly as expected', async () => {
        const service = await serviceFor(fixtureCase.product);

        const line = await service.priceLine({
          productId: fixtureCase.product,
          ...fixtureCase.selection,
        });

        expect({
          unitPriceHalalas: line.unitPrice.halalas,
          lineTotalHalalas: line.lineTotal.halalas,
          breakdown: line.breakdown.map((part) => ({
            kind: part.kind,
            optionId: part.optionId,
            halalas: part.amount.halalas,
          })),
          errors: line.errors,
        }).toEqual(fixtureCase.expected);
      });
    },
  );

  it('prices a product the public cannot see as PRODUCT_UNAVAILABLE, zero', async () => {
    const service = new PricingService(
      publicProducts(new Map()),
      new InMemoryCuttingPackagingIncompatibilities(),
      new InMemoryCatalogMedia(),
      new InMemoryCatalogVendors(),
    );

    const line = await service.priceLine({
      productId: 'gone',
      sizeId: 'sz-1kg',
      cuttingStyleId: null,
      packaging: null,
      exclusionItemIds: [],
      quantity: 1,
    });

    expect(line.unitPrice.halalas).toBe(0);
    expect(line.lineTotal.halalas).toBe(0);
    expect(line.breakdown).toEqual([]);
    expect(line.errors).toEqual(['PRODUCT_UNAVAILABLE']);
  });

  describe('quoteLines', () => {
    const product: FixtureProduct = {
      isAvailable: true,
      sizes: [{ id: 'sz', priceHalalas: 10_000, isAvailable: true }],
      cuttings: [{ cuttingStyleId: 'cut', extraPriceHalalas: 500 }],
      packagings: [{ packaging: 'vacuum', extraPriceHalalas: 300 }],
      exclusions: [{ id: 'fat' }],
      incompatiblePairs: [],
    };
    const selection = {
      productId: 'lamb',
      sizeId: 'sz',
      cuttingStyleId: 'cut',
      packaging: 'vacuum' as const,
      exclusionItemIds: ['fat'],
      quantity: 2,
    };

    async function quoting(pairs: FixtureProduct['incompatiblePairs']) {
      const rules = new InMemoryCuttingPackagingIncompatibilities();
      for (const pair of pairs) {
        await rules.create(pair.cuttingStyleId, pair.packaging);
      }
      const media = new InMemoryCatalogMedia();
      const vendors = new InMemoryCatalogVendors();
      vendors.names.set('lamb', { ar: 'المتجر', en: 'The store' });
      return new PricingService(
        publicProducts(new Map([['lamb', details('lamb', product)]])),
        rules,
        media,
        vendors,
      );
    }

    it('prices each line as priceLine does and names what was chosen', async () => {
      const service = await quoting([]);

      const [quote, gone] = await service.quoteLines([
        selection,
        { ...selection, productId: 'gone' },
      ]);

      expect(quote.priced.unitPrice.halalas).toBe(10_800);
      expect(quote.priced.lineTotal.halalas).toBe(21_600);
      expect(quote.priced.errors).toEqual([]);
      expect(quote.product).toMatchObject({
        vendorName: { en: 'The store' },
        imageUrl: null,
        size: { id: 'sz', approxWeightGrams: 1000 },
        cutting: { id: 'cut' },
        exclusions: [{ id: 'fat' }],
      });
      expect(gone.priced.errors).toEqual(['PRODUCT_UNAVAILABLE']);
      expect(gone.product).toBeNull();
    });

    it('refuses a cutting style and packaging an admin rule forbids together', async () => {
      const service = await quoting([
        { cuttingStyleId: 'cut', packaging: 'vacuum' },
      ]);

      const [quote] = await service.quoteLines([selection]);

      expect(quote.priced.errors).toEqual(['INCOMPATIBLE_CUTTING_PACKAGING']);
      expect(quote.priced.lineTotal.halalas).toBe(0);
    });
  });
});
