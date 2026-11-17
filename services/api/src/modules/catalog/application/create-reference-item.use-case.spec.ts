import { ADMIN } from './catalog-test-data.fake';
import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';

describe('CreateReferenceItemUseCase', () => {
  it('adds an active entry to the list it names only, with no display order', async () => {
    const kit = buildCatalogUseCases();

    const item = await kit.createReferenceItem.execute(
      'meat_types',
      {
        name: { ar: 'حاشي', en: 'Camel' },
      },
      ADMIN,
    );

    expect(item.item).toMatchObject({
      name: { ar: 'حاشي', en: 'Camel' },
      isActive: true,
      sortOrder: null,
    });
    expect(kit.lists.find('meat_types', item.item.id)).toEqual(item.item);
    expect(kit.lists.find('categories', item.item.id)).toBeUndefined();
  });

  it('gives a category its display order, 0 when left out', async () => {
    const kit = buildCatalogUseCases();

    const ordered = await kit.createReferenceItem.execute(
      'categories',
      {
        name: { ar: 'ذبائح', en: 'Whole' },
        sortOrder: 3,
      },
      ADMIN,
    );
    const unordered = await kit.createReferenceItem.execute(
      'categories',
      {
        name: { ar: 'مفروم', en: 'Minced' },
      },
      ADMIN,
    );

    expect(ordered.item.sortOrder).toBe(3);
    expect(unordered.item.sortOrder).toBe(0);
  });

  it('refuses a display order on a list without one, adding nothing', async () => {
    const kit = buildCatalogUseCases();

    await expect(
      kit.createReferenceItem.execute(
        'exclusion_items',
        {
          name: { ar: 'بدون رأس', en: 'No head' },
          sortOrder: 1,
        },
        ADMIN,
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'sortOrder', constraints: ['isOrderedList'] }],
    });
    expect(kit.lists.rows).toEqual([]);
  });

  describe('a category image', () => {
    const IMAGE = '00000000-0000-4000-8000-00000000c1a1';
    const addFile = (
      kit: ReturnType<typeof buildCatalogUseCases>,
      file: Partial<{ ownerId: string; purpose: string; isReady: boolean }>,
    ) =>
      kit.media.add({
        id: IMAGE,
        ownerId: ADMIN,
        purpose: 'catalog.category-image',
        isReady: true,
        ...file,
      });
    const create = (
      kit: ReturnType<typeof buildCatalogUseCases>,
      list: 'categories' | 'meat_types' = 'categories',
    ) =>
      kit.createReferenceItem.execute(
        list,
        { name: { ar: 'ذبائح', en: 'Whole' }, imageMediaId: IMAGE },
        ADMIN,
      );

    it("sets the admin's ready file, returned with its public URL", async () => {
      const kit = buildCatalogUseCases();
      addFile(kit, {});

      const view = await create(kit);

      expect(view.item.imageMediaId).toBe(IMAGE);
      expect(view.imageUrl).toBe(`https://cdn.example.invalid/${IMAGE}`);
    });

    it('refuses an image on another list, even null, adding nothing', async () => {
      const kit = buildCatalogUseCases();
      addFile(kit, {});

      for (const imageMediaId of [IMAGE, null]) {
        await expect(
          kit.createReferenceItem.execute(
            'meat_types',
            { name: { ar: 'حاشي', en: 'Camel' }, imageMediaId },
            ADMIN,
          ),
        ).rejects.toMatchObject({
          code: ErrorCode.VALIDATION_FAILED,
          details: [{ field: 'imageMediaId', constraints: ['isCategoryList'] }],
        });
      }
      expect(kit.lists.rows).toEqual([]);
    });

    it("answers another user's file or another purpose as missing, and an unconfirmed one as not ready", async () => {
      const cases = [
        [{ ownerId: 'someone-else' }, ErrorCode.MEDIA_NOT_FOUND],
        [{ purpose: 'catalog.product-image' }, ErrorCode.MEDIA_NOT_FOUND],
        [{ isReady: false }, ErrorCode.MEDIA_NOT_READY],
      ] as const;
      for (const [file, code] of cases) {
        const kit = buildCatalogUseCases();
        addFile(kit, file);

        await expect(create(kit)).rejects.toMatchObject({ code });
        expect(kit.lists.rows).toEqual([]);
      }
      await expect(create(buildCatalogUseCases())).rejects.toMatchObject({
        code: ErrorCode.MEDIA_NOT_FOUND,
      });
    });
  });
});
