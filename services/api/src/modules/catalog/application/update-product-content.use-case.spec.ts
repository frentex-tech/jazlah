import { ErrorCode } from '@common/errors/error-code.enum';
import { Money } from '@common/money/money';
import { Product } from '../domain/product.entity';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  ADMIN,
  ADMIN_IMAGE,
  CUT,
  OTHER_IMAGE,
  OTHER_VENDOR,
  VENDOR,
  VENDOR_USER,
  content,
  publishedVendorProduct,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

const vendorScope = { kind: 'vendor', vendorId: VENDOR } as const;

describe('UpdateProductContentUseCase', () => {
  it('saves a draft at once, keeping a size by id and the lowest price in step', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    const kept = draft.product.sizes[0];

    const view = await kit.updateContent.execute({
      scope: vendorScope,
      actorId: VENDOR_USER,
      productId: draft.product.id,
      content: content({
        name: { ar: 'نعيمي بلدي', en: 'Local Naimi' },
        sizes: [
          { ...kept, approxWeightGrams: 9_000 },
          {
            id: null,
            approxWeightGrams: 4_000,
            price: Money.of(50_000),
            tag: null,
          },
        ],
      }),
    });

    expect(view.product.name.en).toBe('Local Naimi');
    expect(view.product.sizes[0]).toMatchObject({
      id: kept.id,
      approxWeightGrams: 9_000,
    });
    expect(view.product.minPrice?.halalas).toBe(50_000);
    expect(kit.changeRequests.rows).toEqual([]);
  });

  it('refuses a changed price of an existing size on a draft too: prices change on their own', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    const kept = draft.product.sizes[0];

    await expect(
      kit.updateContent.execute({
        scope: vendorScope,
        actorId: VENDOR_USER,
        productId: draft.product.id,
        content: content({ sizes: [{ ...kept, price: Money.of(90_000) }] }),
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [
        { field: 'sizes.0.priceHalalas', constraints: ['isLivePrice'] },
      ],
    });
  });

  it('refuses a changed price of a kept packaging, and lets a new packaging take any price', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);

    await expect(
      kit.updateContent.execute({
        scope: vendorScope,
        actorId: VENDOR_USER,
        productId: draft.product.id,
        content: content({
          packagings: [{ packaging: 'trays', extraPrice: Money.of(1) }],
        }),
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [
        {
          field: 'packagings.0.extraPriceHalalas',
          constraints: ['isLivePrice'],
        },
      ],
    });

    const view = await kit.updateContent.execute({
      scope: vendorScope,
      actorId: VENDOR_USER,
      productId: draft.product.id,
      content: content({
        packagings: [
          { packaging: 'trays', extraPrice: Money.of(300) },
          { packaging: 'vacuum', extraPrice: Money.of(500) },
        ],
      }),
    });
    expect(
      view.product.packagings.map((option) => [
        option.packaging,
        option.extraPrice.halalas,
      ]),
    ).toEqual([
      ['trays', 300],
      ['vacuum', 500],
    ]);
  });

  it('refuses a packaging named twice', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);

    await expect(
      kit.updateContent.execute({
        scope: vendorScope,
        actorId: VENDOR_USER,
        productId: draft.product.id,
        content: content({
          packagings: [
            { packaging: 'trays', extraPrice: Money.of(300) },
            { packaging: 'trays', extraPrice: Money.of(300) },
          ],
        }),
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [
        { field: 'packagings.1.packaging', constraints: ['isNotRepeated'] },
      ],
    });
  });

  it('refuses a size id named twice, so the lowest price cannot fall below every real one (review finding)', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    const kept = draft.product.sizes[0];
    const before = kit.products.rows;

    await expect(
      kit.updateContent.execute({
        scope: vendorScope,
        actorId: VENDOR_USER,
        productId: draft.product.id,
        content: content({
          sizes: [kept, { ...kept, price: Money.of(100) }],
        }),
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'sizes.1.id', constraints: ['isNotRepeated'] }],
    });
    expect(kit.products.rows).toBe(before);
  });

  it('refuses a cutting style named twice', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);

    await expect(
      kit.updateContent.execute({
        scope: vendorScope,
        actorId: VENDOR_USER,
        productId: draft.product.id,
        content: content({
          cuttings: [
            { cuttingStyleId: CUT, extraPrice: Money.zero() },
            { cuttingStyleId: CUT, extraPrice: Money.of(1) },
          ],
        }),
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [
        { field: 'cuttings.1.cuttingStyleId', constraints: ['isNotRepeated'] },
      ],
    });
  });

  it('refuses any edit of a product under review with PRODUCT_NOT_EDITABLE', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);
    await kit.submitProduct.execute({
      vendorId: VENDOR,
      productId: draft.product.id,
    });

    await expect(
      kit.updateContent.execute({
        scope: vendorScope,
        actorId: VENDOR_USER,
        productId: draft.product.id,
        content: content(),
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.PRODUCT_NOT_EDITABLE,
      details: { status: 'pending_review' },
    });
  });

  it("answers NOT_FOUND for another vendor's product, as for a missing one", async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const draft = await vendorDraft(kit);

    await expect(
      kit.updateContent.execute({
        scope: { kind: 'vendor', vendorId: OTHER_VENDOR },
        actorId: VENDOR_USER,
        productId: draft.product.id,
        content: content(),
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });

  describe('a published product', () => {
    it("stores a vendor's edit as one pending change request; the live version stays", async () => {
      const kit = buildCatalogUseCases();
      seedCatalog(kit);
      const live = await publishedVendorProduct(kit);
      const edit = {
        ...Product.contentOf(live.product),
        name: { ar: 'جديد', en: 'New' },
        imageMediaIds: [...live.product.imageMediaIds, OTHER_IMAGE],
      };

      const view = await kit.updateContent.execute({
        scope: vendorScope,
        actorId: VENDOR_USER,
        productId: live.product.id,
        content: edit,
      });

      expect(view.product.name.en).toBe('Naimi lamb');
      expect(view.changeRequest).toMatchObject({
        status: 'pending',
        requestedById: VENDOR_USER,
        content: { name: { en: 'New' } },
      });
      expect(view.imageUrls.has(OTHER_IMAGE)).toBe(true);
      expect(kit.products.rows[0]?.content.name.en).toBe('Naimi lamb');
    });

    it('closes the pending request as superseded on a second edit and opens a new one', async () => {
      const kit = buildCatalogUseCases();
      seedCatalog(kit);
      const live = await publishedVendorProduct(kit);
      const edit = (en: string) =>
        kit.updateContent.execute({
          scope: vendorScope,
          actorId: VENDOR_USER,
          productId: live.product.id,
          content: { ...Product.contentOf(live.product), name: { ar: en, en } },
        });

      const first = await edit('First');
      const second = await edit('Second');

      expect(second.changeRequest?.id).not.toBe(first.changeRequest?.id);
      expect(
        kit.changeRequests.rows.map((row) => [row.status, row.content.name.en]),
      ).toEqual([
        ['superseded', 'First'],
        ['pending', 'Second'],
      ]);
    });

    it('refuses a changed price of an existing size: prices change on their own', async () => {
      const kit = buildCatalogUseCases();
      seedCatalog(kit);
      const live = await publishedVendorProduct(kit);
      const current = Product.contentOf(live.product);

      await expect(
        kit.updateContent.execute({
          scope: vendorScope,
          actorId: VENDOR_USER,
          productId: live.product.id,
          content: {
            ...current,
            sizes: [{ ...current.sizes[0], price: Money.of(1) }],
          },
        }),
      ).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
        details: [
          { field: 'sizes.0.priceHalalas', constraints: ['isLivePrice'] },
        ],
      });
      expect(kit.changeRequests.rows).toEqual([]);
    });

    it('refuses an edit that breaks the submission rules; a forbidden pair is not one', async () => {
      const kit = buildCatalogUseCases();
      seedCatalog(kit);
      const live = await publishedVendorProduct(kit);
      await kit.createIncompatibility.execute(CUT, 'vacuum');

      await expect(
        kit.updateContent.execute({
          scope: vendorScope,
          actorId: VENDOR_USER,
          productId: live.product.id,
          content: {
            ...Product.contentOf(live.product),
            imageMediaIds: [],
            packagings: [{ packaging: 'vacuum', extraPrice: Money.zero() }],
          },
        }),
      ).rejects.toMatchObject({
        code: ErrorCode.PRODUCT_NOT_SUBMITTABLE,
        details: { reasons: ['NO_IMAGE'] },
      });
    });

    it("applies an admin's edit of a published JAZLA product at once, audited", async () => {
      const kit = buildCatalogUseCases();
      seedCatalog(kit);
      const draft = await kit.createProduct.execute({
        scope: { kind: 'platform' },
        actorId: ADMIN,
        fulfilment: 'delivery',
        content: content({ imageMediaIds: [ADMIN_IMAGE] }),
      });
      await kit.publishPlatformProduct.execute({
        actorId: ADMIN,
        productId: draft.product.id,
      });
      const published = await kit.getProduct.execute(
        { kind: 'any' },
        draft.product.id,
      );
      kit.audit.rows = [];

      const view = await kit.updateContent.execute({
        scope: { kind: 'platform' },
        actorId: ADMIN,
        productId: draft.product.id,
        content: {
          ...Product.contentOf(published.product),
          name: { ar: 'ب', en: 'B' },
        },
      });

      expect(view.product.name.en).toBe('B');
      expect(view.changeRequest).toBeNull();
      expect(kit.audit.rows).toEqual([
        {
          actorId: ADMIN,
          action: 'catalog.product.updated',
          entity: 'product',
          entityId: draft.product.id,
        },
      ]);
    });
  });
});
