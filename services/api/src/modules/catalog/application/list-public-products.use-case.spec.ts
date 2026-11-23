import { Money } from '@common/money/money';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  CATEGORY,
  MEAT_TYPE,
  OTHER_VENDOR,
  VENDOR,
  publishedVendorProduct,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

const page = { cursor: null, limit: 20 };

describe('ListPublicProductsUseCase', () => {
  it('lists published products with their vendor name, hiding unpublished ones', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    await vendorDraft(kit);

    const result = await kit.listPublicProducts.execute({}, page);

    expect(result.items.map((card) => card.summary.id)).toEqual([
      live.product.id,
    ]);
    expect(result.items[0]?.vendorName).toEqual({
      ar: 'ملحمة النخبة',
      en: 'Al Nokhba',
    });
  });

  it('filters by category, vendor, meat type and price range', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    const list = (
      filter: Parameters<typeof kit.listPublicProducts.execute>[0],
    ) =>
      kit.listPublicProducts
        .execute(filter, page)
        .then((result) => result.items.map((card) => card.summary.id));

    expect(await list({ categoryId: CATEGORY })).toEqual([live.product.id]);
    expect(await list({ vendorId: VENDOR })).toEqual([live.product.id]);
    expect(await list({ vendorId: OTHER_VENDOR })).toEqual([]);
    expect(await list({ meatTypeId: MEAT_TYPE })).toEqual([live.product.id]);
    expect(
      await list({ minPrice: Money.of(95_000), maxPrice: Money.of(95_000) }),
    ).toEqual([live.product.id]);
    expect(await list({ minPrice: Money.of(95_001) })).toEqual([]);
    expect(await list({ maxPrice: Money.of(94_999) })).toEqual([]);
  });

  it('searches the name in both languages, normalised, with the other filters', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const live = await publishedVendorProduct(kit);
    const list = (
      filter: Parameters<typeof kit.listPublicProducts.execute>[0],
    ) =>
      kit.listPublicProducts
        .execute(filter, page)
        .then((result) => result.items.map((card) => card.summary.id));

    expect(await list({ text: 'NAIMI' })).toEqual([live.product.id]);
    expect(await list({ text: 'نعيمى' })).toEqual([live.product.id]);
    expect(await list({ text: 'نَعيمي', categoryId: CATEGORY })).toEqual([
      live.product.id,
    ]);
    expect(await list({ text: 'naimi', vendorId: OTHER_VENDOR })).toEqual([]);
    expect(await list({ text: 'goat' })).toEqual([]);
    expect(await list({ text: 'lamb naimi' })).toEqual([live.product.id]);
    expect(await list({ text: 'naimi goat' })).toEqual([]);
    expect(await list({ text: 'n a' })).toEqual([]);
    // Only marks: nothing is left to match, so nothing matches.
    expect(await list({ text: 'ًـ' })).toEqual([]);
  });
});
