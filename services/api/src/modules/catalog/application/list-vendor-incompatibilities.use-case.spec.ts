import { buildCatalogUseCases } from './catalog-use-cases.fake';
import { CUT, OTHER_CUT, seedCatalog } from './catalog-test-data.fake';

describe('ListVendorIncompatibilitiesUseCase', () => {
  it('lists the rules of active cutting styles with their names, oldest first', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    await kit.createIncompatibility.execute(CUT, 'vacuum');
    await kit.createIncompatibility.execute(OTHER_CUT, 'trays');
    await kit.createIncompatibility.execute(CUT, 'bags');
    await kit.updateReferenceItem.execute(
      'cutting_styles',
      OTHER_CUT,
      { isActive: false },
      'admin',
    );

    const rules = await kit.listVendorIncompatibilities.execute();

    const name = kit.lists.find('cutting_styles', CUT)?.name;
    expect(rules).toEqual([
      { cuttingStyle: { id: CUT, name }, packaging: 'vacuum' },
      { cuttingStyle: { id: CUT, name }, packaging: 'bags' },
    ]);
  });
});
