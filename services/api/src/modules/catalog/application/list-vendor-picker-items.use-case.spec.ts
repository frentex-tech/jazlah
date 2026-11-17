import { buildCatalogUseCases } from './catalog-use-cases.fake';

describe('ListVendorPickerItemsUseCase', () => {
  it('lists the active entries of one list only, oldest first, with both names', async () => {
    const kit = buildCatalogUseCases();
    const first = kit.lists.seed('cutting_styles', 'cut-first');
    kit.lists.seed('cutting_styles', 'cut-off', false);
    const second = kit.lists.seed('cutting_styles', 'cut-second');
    kit.lists.seed('meat_types', 'meat-type');

    const items = await kit.listVendorPickerItems.execute('cutting_styles');

    expect(items).toEqual([
      { id: first.id, name: first.name },
      { id: second.id, name: second.name },
    ]);
  });

  it('is empty for a list with no active entry', async () => {
    const kit = buildCatalogUseCases();
    kit.lists.seed('exclusion_items', 'gone', false);

    expect(await kit.listVendorPickerItems.execute('exclusion_items')).toEqual(
      [],
    );
  });
});
