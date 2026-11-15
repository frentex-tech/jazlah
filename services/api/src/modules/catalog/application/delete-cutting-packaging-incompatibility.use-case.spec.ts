import { ErrorCode } from '@common/errors/error-code.enum';
import { buildCatalogUseCases } from './catalog-use-cases.fake';
import { CUT, UNKNOWN, seedCatalog } from './catalog-test-data.fake';

describe('DeleteCuttingPackagingIncompatibilityUseCase', () => {
  it('removes a rule, then answers NOT_FOUND for it', async () => {
    const kit = buildCatalogUseCases();
    seedCatalog(kit);
    const rule = await kit.createIncompatibility.execute(CUT, 'vacuum');

    await kit.deleteIncompatibility.execute(rule.id);

    expect(kit.rules.rows).toEqual([]);
    for (const id of [rule.id, UNKNOWN]) {
      await expect(kit.deleteIncompatibility.execute(id)).rejects.toMatchObject(
        {
          code: ErrorCode.NOT_FOUND,
        },
      );
    }
  });
});
