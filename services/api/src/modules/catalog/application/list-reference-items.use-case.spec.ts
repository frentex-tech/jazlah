import { ADMIN } from './catalog-test-data.fake';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import { CUT, OTHER_CUT, seedCatalog } from './catalog-test-data.fake';

describe('ListReferenceItemsUseCase', () => {
  it('lists one list newest first, all entries or only active ones', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    await kit.updateReferenceItem.execute(
      'cutting_styles',
      CUT,
      {
        isActive: false,
      },
      ADMIN,
    );
    const page = { cursor: null, limit: 20 };

    const all = await kit.listReferenceItems.execute(
      'cutting_styles',
      {},
      page,
    );
    const active = await kit.listReferenceItems.execute(
      'cutting_styles',
      { isActive: true },
      page,
    );

    expect(all.items.map((view) => view.item.id)).toEqual([OTHER_CUT, CUT]);
    expect(active.items.map((view) => view.item.id)).toEqual([OTHER_CUT]);
    expect(all.nextCursor).toBeNull();
  });
});
