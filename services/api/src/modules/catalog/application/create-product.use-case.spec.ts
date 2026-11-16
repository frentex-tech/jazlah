import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  ADMIN,
  ADMIN_IMAGE,
  CUT,
  IMAGE,
  OTHER_USER,
  PLATFORM,
  UNKNOWN,
  VENDOR,
  VENDOR_USER,
  content,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

describe('CreateProductUseCase', () => {
  it("creates the vendor's draft with its options and the lowest size price", async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);

    const view = await vendorDraft(kit, {
      sizes: [
        {
          id: null,
          approxWeightGrams: 12_000,
          price: Money.of(130_000),
          tag: null,
        },
        {
          id: null,
          approxWeightGrams: 8_000,
          price: Money.of(95_000),
          tag: null,
        },
      ],
    });

    expect(view.product).toMatchObject({
      vendorId: VENDOR,
      status: 'draft',
      isAvailable: true,
      fulfilment: 'both',
      packagings: ['trays'],
    });
    expect(view.product.minPrice?.halalas).toBe(95_000);
    expect(view.product.sizes.map((size) => size.price.halalas)).toEqual([
      130_000, 95_000,
    ]);
    expect(view.imageUrls.get(IMAGE)).toBe(
      `https://cdn.example.invalid/${IMAGE}`,
    );
  });

  it('allows an incomplete draft: no size (no lowest price) and no image', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);

    const view = await vendorDraft(kit, { sizes: [], imageMediaIds: [] });

    expect(view.product.minPrice).toBeNull();
  });

  it("creates JAZLA's draft under the platform vendor, with the admin's image", async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);

    const view = await kit.createProduct.execute({
      scope: { kind: 'platform' },
      actorId: ADMIN,
      fulfilment: 'delivery',
      content: content({ imageMediaIds: [ADMIN_IMAGE] }),
    });

    expect(view.product.vendorId).toBe(PLATFORM);
  });

  it('answers NOT_FOUND for a JAZLA product before the platform vendor exists', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    kit.vendors.platformId = null;

    await expect(
      kit.createProduct.execute({
        scope: { kind: 'platform' },
        actorId: ADMIN,
        fulfilment: 'delivery',
        content: content({ imageMediaIds: [ADMIN_IMAGE] }),
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
      details: { reason: 'PLATFORM_VENDOR_MISSING' },
    });
  });

  it('refuses unknown or inactive list entries, each on its field', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    await kit.updateReferenceItem.execute('cutting_styles', CUT, {
      isActive: false,
    });

    await expect(
      vendorDraft(kit, {
        categoryId: UNKNOWN,
        meatTypeId: UNKNOWN,
        exclusionItemIds: [UNKNOWN],
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [
        { field: 'categoryId', constraints: ['isActiveCategory'] },
        { field: 'meatTypeId', constraints: ['isActiveMeatType'] },
        {
          field: 'cuttings.0.cuttingStyleId',
          constraints: ['isActiveCuttingStyle'],
        },
        { field: 'exclusionItemIds.0', constraints: ['isActiveExclusionItem'] },
      ],
    });
    expect(kit.products.rows).toEqual([]);
  });

  it("refuses another user's image or a missing one as MEDIA_NOT_FOUND, an unconfirmed one as MEDIA_NOT_READY", async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    kit.media.add({
      id: UNKNOWN,
      ownerId: VENDOR_USER,
      purpose: 'catalog.product-image',
      isReady: false,
    });
    const attempt = (actorId: string, imageId: string) =>
      kit.createProduct.execute({
        scope: { kind: 'vendor', vendorId: VENDOR },
        actorId,
        fulfilment: 'both',
        content: content({ imageMediaIds: [imageId] }),
      });

    await expect(attempt(OTHER_USER, IMAGE)).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_FOUND,
    });
    await expect(attempt(VENDOR_USER, ADMIN_IMAGE)).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_FOUND,
    });
    await expect(attempt(VENDOR_USER, UNKNOWN)).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_READY,
    });
    expect(kit.products.rows).toEqual([]);
  });

  it('refuses a cutting style named twice, creating nothing', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);

    await expect(
      vendorDraft(kit, {
        cuttings: [
          { cuttingStyleId: CUT, extraPrice: Money.zero() },
          { cuttingStyleId: CUT, extraPrice: Money.of(1) },
        ],
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [
        { field: 'cuttings.1.cuttingStyleId', constraints: ['isNotRepeated'] },
      ],
    });
    expect(kit.products.rows).toEqual([]);
  });

  it('refuses a size id on a new product', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);

    await expect(
      vendorDraft(kit, {
        sizes: [
          { id: UNKNOWN, approxWeightGrams: 1, price: Money.of(1), tag: null },
        ],
      }),
    ).rejects.toMatchObject({ details: [{ field: 'sizes.0.id' }] });
  });
});
