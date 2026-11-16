import { buildCatalogUseCases } from './catalog-use-cases.fake';
import { CUT, OTHER_CUT, seedCatalog } from './catalog-test-data.fake';

describe('ListCuttingPackagingIncompatibilitiesUseCase', () => {
  it('lists the rules newest first, page by page', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const first = await kit.createIncompatibility.execute(CUT, 'vacuum');
    const second = await kit.createIncompatibility.execute(OTHER_CUT, 'bags');

    const page1 = await kit.listIncompatibilities.execute({
      cursor: null,
      limit: 1,
    });
    const page2 = await kit.listIncompatibilities.execute({
      cursor: page1.nextCursor,
      limit: 1,
    });

    expect(page1.items.map((rule) => rule.id)).toEqual([second.id]);
    expect(page2.items.map((rule) => rule.id)).toEqual([first.id]);
    expect(page2.nextCursor).toBeNull();
  });
});
