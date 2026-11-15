import { buildCatalogUseCases } from './catalog-use-cases.fake';

describe('CreateReferenceItemUseCase', () => {
  it('adds an active entry to the list it names only', async () => {
    const kit = buildCatalogUseCases();

    const item = await kit.createReferenceItem.execute('meat_types', {
      ar: 'حاشي',
      en: 'Camel',
    });

    expect(item).toMatchObject({
      name: { ar: 'حاشي', en: 'Camel' },
      isActive: true,
    });
    expect(kit.lists.find('meat_types', item.id)).toEqual(item);
    expect(kit.lists.find('categories', item.id)).toBeUndefined();
  });
});
