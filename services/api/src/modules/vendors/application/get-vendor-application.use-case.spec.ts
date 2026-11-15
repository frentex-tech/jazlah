import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { submitted } from './vendors-test-data.fake';

describe('GetVendorApplicationUseCase', () => {
  it('returns the application with a link for each document', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);

    const found = await kit.getApplication.execute(application.id);

    expect(found.application.id).toBe(application.id);
    expect([...found.documentLinks.keys()]).toEqual(
      application.documents.map((document) => document.mediaId),
    );
    expect(
      found.documentLinks.get(application.documents[0]?.mediaId ?? ''),
    ).toMatchObject({ url: expect.stringContaining('https://') as unknown });
  });

  it('is NOT_FOUND for an unknown id', async () => {
    const kit = buildVendorsUseCases();

    await expect(
      kit.getApplication.execute('00000000-0000-4000-8000-0000000000ff'),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
