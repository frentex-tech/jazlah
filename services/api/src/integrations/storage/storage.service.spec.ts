import type { StorageConfig } from '@config/storage-config.type';
import { FakeStorageProvider } from './providers/fake.provider';
import { StorageService } from './storage.service';

const NOW = Date.UTC(2026, 10, 14, 12, 0, 0);
const CONFIG: StorageConfig = {
  provider: 's3',
  endpoint: undefined,
  region: 'us-east-1',
  forcePathStyle: false,
  accessKeyId: 'example-access-key',
  secretAccessKey: 'example-secret-key',
  publicBucket: 'example-public',
  privateBucket: 'example-private',
  publicBaseUrl: 'https://cdn.example.invalid/media',
  uploadUrlExpirySeconds: 300,
  downloadUrlExpirySeconds: 600,
};

function setup(): { service: StorageService; fake: FakeStorageProvider } {
  const fake = new FakeStorageProvider(() => NOW);
  return { service: new StorageService(fake, CONFIG), fake };
}

describe('StorageService', () => {
  it.each([
    ['public', 'example-public'],
    ['private', 'example-private'],
  ] as const)(
    'puts %s objects in their own bucket',
    async (visibility, bucket) => {
      const { service } = setup();

      const upload = await service.createUpload({
        visibility,
        key: 'a/b',
        contentType: 'image/png',
        maxSizeBytes: 10,
      });

      expect(upload.location).toEqual({ bucket, key: 'a/b' });
      expect(upload.fields.bucket).toBe(bucket);
    },
  );

  it('limits an upload to 1 byte up to the maximum, the exact type and the configured expiry', async () => {
    const { service, fake } = setup();

    const upload = await service.createUpload({
      visibility: 'private',
      key: 'a/b',
      contentType: 'application/pdf',
      maxSizeBytes: 4,
    });

    expect(upload.expiresAt).toEqual(new Date(NOW + 300_000));
    const file = (size: number, contentType = 'application/pdf') => ({
      bytes: new Uint8Array(size),
      contentType,
    });
    expect(fake.upload(upload, file(0))).toEqual({
      accepted: false,
      code: 'EntityTooSmall',
    });
    expect(fake.upload(upload, file(5))).toEqual({
      accepted: false,
      code: 'EntityTooLarge',
    });
    expect(fake.upload(upload, file(4, 'image/png'))).toEqual({
      accepted: false,
      code: 'AccessDenied',
    });
    expect(fake.upload(upload, file(4))).toEqual({ accepted: true });
  });

  it('presigns a download for the configured time', async () => {
    const { service } = setup();

    const download = await service.createDownload({
      bucket: 'example-private',
      key: 'a/b',
    });

    expect(download.expiresAt).toEqual(new Date(NOW + 600_000));
  });

  it('builds a public URL from the base URL, encoding each key segment', () => {
    const { service } = setup();

    expect(service.publicUrl('catalog/product-image/2026/11/14/id one')).toBe(
      'https://cdn.example.invalid/media/catalog/product-image/2026/11/14/id%20one',
    );
  });

  it('passes a provider failure through unchanged', async () => {
    const { service, fake } = setup();
    const failure = new Error('provider failed');
    fake.failNext('deleteObject', failure);

    await expect(service.deleteObject({ bucket: 'b', key: 'k' })).rejects.toBe(
      failure,
    );
  });
});
