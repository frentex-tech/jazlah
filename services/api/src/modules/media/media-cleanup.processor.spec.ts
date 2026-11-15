import type { Job } from 'bullmq';
import type { MediaConfig } from '@config/media-config.type';
import type { StorageConfig } from '@config/storage-config.type';
import type { DbContext } from '@infra/database/db-context';
import { StorageService } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { InMemoryMediaClient } from './in-memory-media-client.fake';
import { MEDIA_CLEANUP } from './media-cleanup.constants';
import { MediaCleanupProcessor } from './media-cleanup.processor';
import { MediaService } from './media.service';

const NOW = Date.UTC(2026, 10, 14, 9, 30, 0);
const LOCATION = {
  bucket: 'example-private',
  key: 'vendor/document/2026/11/14/a',
};

function setup() {
  const client = new InMemoryMediaClient();
  const storage = new FakeStorageProvider(() => NOW);
  const media = new MediaService(
    { client } as unknown as DbContext,
    new StorageService(storage, {
      privateBucket: 'example-private',
      publicBucket: 'example-public',
    } as StorageConfig),
    { pendingUploadTtlSeconds: 3_600 } as MediaConfig,
  );
  return {
    processor: new MediaCleanupProcessor(media),
    media,
    client,
    storage,
  };
}

const job = {
  id: '1',
  name: MEDIA_CLEANUP.jobName,
  data: {},
  queueName: 'media-cleanup',
} as unknown as Job<unknown, number>;

describe('MediaCleanupProcessor', () => {
  beforeEach(() => {
    jest.useFakeTimers({
      now: NOW,
      doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('removes expired uploads through MediaService, passing the abort signal on', async () => {
    const { processor, media } = setup();
    const remove = jest.spyOn(media, 'removeExpiredUploads');
    const controller = new AbortController();

    await processor.process(job, undefined, controller.signal);

    expect(remove).toHaveBeenCalledWith(controller.signal);
  });

  it('run twice for the same expired upload, removes it once', async () => {
    const { processor, client, storage } = setup();
    client.seed({
      id: 'a',
      bucket: LOCATION.bucket,
      objectKey: LOCATION.key,
      status: 'pending',
      rejectionReason: null,
      expiresAt: new Date(NOW - 1),
    });
    storage.putObject(LOCATION, new Uint8Array(3), 'application/pdf');

    await expect(processor.process(job)).resolves.toBe(1);
    await expect(processor.process(job)).resolves.toBe(0);

    expect(client.rows.size).toBe(0);
    expect(storage.hasObject(LOCATION)).toBe(false);
  });
});
