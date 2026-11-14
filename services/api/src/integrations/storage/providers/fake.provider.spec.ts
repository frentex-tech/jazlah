import { FakeStorageProvider } from './fake.provider';

const LOCATION = { bucket: 'example-private', key: 'k' };

describe('FakeStorageProvider', () => {
  it('refuses an upload after its policy expired, and one with a changed key', async () => {
    let now = 1_000_000;
    const fake = new FakeStorageProvider(() => now);
    const upload = await fake.createPresignedUpload({
      location: LOCATION,
      contentType: 'image/png',
      minSizeBytes: 1,
      maxSizeBytes: 10,
      expiresInSeconds: 60,
    });
    const file = { bytes: new Uint8Array(3), contentType: 'image/png' };

    expect(
      fake.upload(
        { ...upload, fields: { ...upload.fields, key: 'other' } },
        file,
      ),
    ).toEqual({ accepted: false, code: 'AccessDenied' });
    now += 60_001;
    expect(fake.upload(upload, file)).toEqual({
      accepted: false,
      code: 'AccessDenied',
    });
    expect(fake.hasObject(LOCATION)).toBe(false);
  });

  it('stores an accepted upload with its declared type and reads it back', async () => {
    const fake = new FakeStorageProvider(() => 0);
    const upload = await fake.createPresignedUpload({
      location: LOCATION,
      contentType: 'image/png',
      minSizeBytes: 1,
      maxSizeBytes: 10,
      expiresInSeconds: 60,
    });

    fake.upload(upload, {
      bytes: Uint8Array.from([1, 2, 3]),
      contentType: 'image/png',
    });

    await expect(fake.getObjectMetadata(LOCATION)).resolves.toEqual({
      sizeBytes: 3,
      contentType: 'image/png',
    });
    await expect(fake.readObjectStart(LOCATION, 2)).resolves.toEqual(
      Uint8Array.from([1, 2]),
    );
    await fake.deleteObject(LOCATION);
    await fake.deleteObject(LOCATION);
    await expect(fake.getObjectMetadata(LOCATION)).resolves.toBeNull();
  });

  it('records calls and fails once on request', async () => {
    const fake = new FakeStorageProvider();
    const failure = new Error('told to fail');
    fake.failNext('getObjectMetadata', failure);

    await expect(fake.getObjectMetadata(LOCATION)).rejects.toBe(failure);
    await expect(fake.getObjectMetadata(LOCATION)).resolves.toBeNull();
    expect(fake.calls).toEqual([
      { operation: 'getObjectMetadata', location: LOCATION },
      { operation: 'getObjectMetadata', location: LOCATION },
    ]);
  });
});
