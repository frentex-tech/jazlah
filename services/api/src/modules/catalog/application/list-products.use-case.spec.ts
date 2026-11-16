import { buildCatalogUseCases } from './catalog-use-cases.fake';
import {
  IMAGE,
  OTHER_VENDOR,
  VENDOR,
  seedCatalog,
  vendorDraft,
} from './catalog-test-data.fake';

const page = { cursor: null, limit: 20 };

describe('ListProductsUseCase', () => {
  it("lists a vendor's own products only, whatever vendor filter is passed", async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const mine = await vendorDraft(kit);

    const own = await kit.listProducts.execute(
      { kind: 'vendor', vendorId: VENDOR },
      { vendorId: OTHER_VENDOR },
      page,
    );
    const other = await kit.listProducts.execute(
      { kind: 'vendor', vendorId: OTHER_VENDOR },
      {},
      page,
    );

    expect(own.items.map((card) => card.summary.id)).toEqual([mine.product.id]);
    expect(own.items[0]).toMatchObject({
      coverUrl: `https://cdn.example.invalid/${IMAGE}`,
      vendorName: { en: 'Al Nokhba' },
    });
    expect(other.items).toEqual([]);
  });

  it('gives admins the review queue: products under review, of any vendor', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const waiting = await vendorDraft(kit);
    await vendorDraft(kit);
    await kit.submitProduct.execute({
      vendorId: VENDOR,
      productId: waiting.product.id,
    });

    const queue = await kit.listProducts.execute(
      { kind: 'any' },
      { status: 'pending_review' },
      page,
    );

    expect(queue.items.map((card) => card.summary.id)).toEqual([
      waiting.product.id,
    ]);
  });
});
