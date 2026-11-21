import { ErrorCode } from '@common/errors/error-code.enum';
import { StorageError } from '../storage.errors';
import { DisabledStorageProvider } from './disabled.provider';

describe('DisabledStorageProvider', () => {
  const provider = new DisabledStorageProvider();

  it('refuses uploads, downloads and copies with a non-retryable 503', async () => {
    const calls = [
      provider.createPresignedUpload(),
      provider.createPresignedDownload(),
      provider.copyObject(),
    ];
    for (const call of calls) {
      const error: unknown = await call.catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(StorageError);
      expect(error).toMatchObject({
        code: ErrorCode.SERVICE_UNAVAILABLE,
        status: 503,
        reason: 'disabled',
        retryable: false,
      });
    }
  });

  it('finds no object and deletes without failing, so the cleanup keeps running', async () => {
    await expect(provider.getObjectMetadata()).resolves.toBeNull();
    await expect(provider.readObjectStart()).resolves.toBeNull();
    await expect(provider.deleteObject()).resolves.toBeUndefined();
  });
});
