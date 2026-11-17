import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  CUT,
  OTHER_CUT,
  UNKNOWN,
  VENDOR,
  VENDOR_USER,
  publishedVendorProduct,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

const scope = { kind: 'vendor', vendorId: VENDOR } as const;

describe('ChangeProductPricesUseCase', () => {
  it('changes a published product at once: prices, lowest price, one audit entry per change', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    const sizeId = live.product.sizes[0].id;
    kit.audit.rows = [];

    const view = await kit.changePrices.execute({
      scope,
      actorId: VENDOR_USER,
      productId: live.product.id,
      changes: {
        sizes: [{ sizeId, price: Money.of(89_999) }],
        cuttings: [{ cuttingStyleId: CUT, extraPrice: Money.of(1_500) }],
        packagings: [{ packaging: 'trays', extraPrice: Money.of(300) }],
      },
    });

    expect(view.product.sizes[0]?.price.halalas).toBe(89_999);
    expect(view.product.minPrice?.halalas).toBe(89_999);
    expect(view.product.status).toBe('published');
    expect(kit.changeRequests.rows).toEqual([]);
    // The cutting and the packaging kept their prices: no entry for them.
    expect(kit.audit.rows).toEqual([
      {
        actorId: VENDOR_USER,
        action: 'catalog.product.price_changed',
        entity: 'product',
        entityId: live.product.id,
        metadata: { sizeId, previousHalalas: 95_000, newHalalas: 89_999 },
      },
    ]);
  });

  it('audits a cutting extra price change', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    kit.audit.rows = [];

    await kit.changePrices.execute({
      scope,
      actorId: VENDOR_USER,
      productId: live.product.id,
      changes: {
        sizes: [],
        cuttings: [{ cuttingStyleId: CUT, extraPrice: Money.zero() }],
        packagings: [],
      },
    });

    expect(kit.audit.rows).toEqual([
      expect.objectContaining({
        metadata: {
          cuttingStyleId: CUT,
          previousHalalas: 1_500,
          newHalalas: 0,
        },
      }),
    ]);
  });

  it('changes and audits a packaging extra price at once on a published product', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    kit.audit.rows = [];

    const view = await kit.changePrices.execute({
      scope,
      actorId: VENDOR_USER,
      productId: live.product.id,
      changes: {
        sizes: [],
        cuttings: [],
        packagings: [{ packaging: 'trays', extraPrice: Money.of(750) }],
      },
    });

    expect(
      view.product.packagings.map((option) => option.extraPrice.halalas),
    ).toEqual([750]);
    expect(view.product.status).toBe('published');
    expect(kit.changeRequests.rows).toEqual([]);
    expect(kit.audit.rows).toEqual([
      {
        actorId: VENDOR_USER,
        action: 'catalog.product.price_changed',
        entity: 'product',
        entityId: live.product.id,
        metadata: { packaging: 'trays', previousHalalas: 300, newHalalas: 750 },
      },
    ]);
  });

  it("refuses ids that are not the product's own, changing nothing", async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    kit.audit.rows = [];

    await expect(
      kit.changePrices.execute({
        scope,
        actorId: VENDOR_USER,
        productId: live.product.id,
        changes: {
          sizes: [{ sizeId: UNKNOWN, price: Money.of(1) }],
          cuttings: [{ cuttingStyleId: OTHER_CUT, extraPrice: Money.of(1) }],
          packagings: [{ packaging: 'vacuum', extraPrice: Money.of(1) }],
        },
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [
        { field: 'sizes.0.sizeId', constraints: ['isSizeOfProduct'] },
        {
          field: 'cuttings.0.cuttingStyleId',
          constraints: ['isCuttingOfProduct'],
        },
        {
          field: 'packagings.0.packaging',
          constraints: ['isPackagingOfProduct'],
        },
      ],
    });
    expect(kit.audit.rows).toEqual([]);
  });

  it('refuses a size or a cutting style named twice, changing nothing', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    const sizeId = live.product.sizes[0].id;
    const before = kit.products.rows;

    await expect(
      kit.changePrices.execute({
        scope,
        actorId: VENDOR_USER,
        productId: live.product.id,
        changes: {
          sizes: [
            { sizeId, price: Money.of(100) },
            { sizeId, price: Money.of(200) },
          ],
          cuttings: [
            { cuttingStyleId: CUT, extraPrice: Money.zero() },
            { cuttingStyleId: CUT, extraPrice: Money.of(1) },
          ],
          packagings: [
            { packaging: 'trays', extraPrice: Money.zero() },
            { packaging: 'trays', extraPrice: Money.of(1) },
          ],
        },
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [
        { field: 'sizes.1.sizeId', constraints: ['isNotRepeated'] },
        { field: 'cuttings.1.cuttingStyleId', constraints: ['isNotRepeated'] },
        { field: 'packagings.1.packaging', constraints: ['isNotRepeated'] },
      ],
    });
    expect(kit.products.rows).toBe(before);
  });

  it('refuses a product under review', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    await kit.submitProduct.execute({
      vendorId: VENDOR,
      productId: draft.product.id,
    });

    await expect(
      kit.changePrices.execute({
        scope,
        actorId: VENDOR_USER,
        productId: draft.product.id,
        changes: { sizes: [], cuttings: [], packagings: [] },
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PRODUCT_NOT_EDITABLE });
  });
});
