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

  it('copies an object with its type, and reports a missing source', async () => {
    const fake = new FakeStorageProvider();
    const target = { bucket: 'example-public', key: 'copy' };
    fake.putObject(LOCATION, Uint8Array.from([7, 8]), 'image/png');

    await expect(fake.copyObject(LOCATION, target)).resolves.toBe(true);
    await expect(fake.getObjectMetadata(target)).resolves.toEqual({
      sizeBytes: 2,
      contentType: 'image/png',
    });
    await fake.deleteObject(LOCATION);
    await expect(fake.copyObject(LOCATION, target)).resolves.toBe(false);
    expect(fake.objectBytes(target)).toEqual(Uint8Array.from([7, 8]));
  });

  it('holds a paused call until it is released', async () => {
    const fake = new FakeStorageProvider();
    const gate = fake.pause('deleteObject');
    fake.putObject(LOCATION, Uint8Array.from([1]), null);

    const deleting = fake.deleteObject(LOCATION);
    await gate.reached;
    expect(fake.hasObject(LOCATION)).toBe(true);
    gate.release();
    await deleting;
    expect(fake.hasObject(LOCATION)).toBe(false);
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
