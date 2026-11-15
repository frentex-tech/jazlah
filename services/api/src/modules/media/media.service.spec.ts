import type { MediaConfig } from '@config/media-config.type';
import type { StorageConfig } from '@config/storage-config.type';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { DbContext } from '@infra/database/db-context';
import {
  StorageError,
  StorageService,
  type PresignedUpload,
} from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { InMemoryMediaClient } from './in-memory-media-client.fake';
import { MediaService } from './media.service';

const NOW = Date.UTC(2026, 10, 14, 9, 30, 0);
const TTL_SECONDS = 3_600;
const MEGABYTE = 1024 * 1024;
const STORAGE_CONFIG: StorageConfig = {
  provider: 's3',
  endpoint: undefined,
  region: 'us-east-1',
  forcePathStyle: false,
  accessKeyId: 'example-access-key',
  secretAccessKey: 'example-secret-key',
  publicBucket: 'example-public',
  privateBucket: 'example-private',
  publicBaseUrl: 'https://cdn.example.invalid',
  uploadUrlExpirySeconds: 300,
  downloadUrlExpirySeconds: 600,
};
const MEDIA_CONFIG: MediaConfig = {
  pendingUploadTtlSeconds: TTL_SECONDS,
  cleanupIntervalSeconds: 900,
};

/** File starts, padded to `size` bytes. */
const file = (start: number[], size = 64): Uint8Array => {
  const bytes = new Uint8Array(size);
  bytes.set(start.slice(0, size));
  return bytes;
};
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37];
/** A Windows executable ("MZ") renamed to .jpg. */
const EXE = [0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00];

function setup() {
  const client = new InMemoryMediaClient();
  const storage = new FakeStorageProvider(() => Date.now());
  const service = new MediaService(
    { client } as unknown as DbContext,
    new StorageService(storage, STORAGE_CONFIG),
    MEDIA_CONFIG,
  );
  return { service, client, storage };
}

/** Requests an upload and plays the client's POST with `bytes`. */
async function uploaded(
  context: ReturnType<typeof setup>,
  bytes: Uint8Array,
  options: {
    purpose?: 'catalog.product-image' | 'vendor.document';
    contentType?: string;
  } = {},
): Promise<{
  mediaId: string;
  ticket: PresignedUpload;
  location: { bucket: string; key: string };
}> {
  const contentType = options.contentType ?? 'image/jpeg';
  const ticket = await context.service.requestUpload({
    purpose: options.purpose ?? 'catalog.product-image',
    contentType,
  });
  expect(context.storage.upload(ticket, { bytes, contentType })).toEqual({
    accepted: true,
  });
  const row = context.client.rows.get(ticket.mediaId);
  return {
    mediaId: ticket.mediaId,
    ticket,
    location: { bucket: String(row?.bucket), key: String(row?.objectKey) },
  };
}

async function errorOf(work: Promise<unknown>): Promise<AppError> {
  const error: unknown = await work.then(
    () => undefined,
    (thrown: unknown) => thrown,
  );
  if (!(error instanceof AppError)) {
    throw new Error(`expected an AppError, got ${String(error)}`);
  }
  return error;
}

describe('MediaService', () => {
  beforeEach(() => {
    jest.useFakeTimers({
      now: NOW,
      doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('requestUpload', () => {
    it('creates a pending row and an upload ticket under a server-generated key', async () => {
      const context = setup();

      const ticket = await context.service.requestUpload({
        purpose: 'catalog.product-image',
        contentType: 'image/webp',
        fileName: '../../my photo.webp',
      });

      const row = context.client.rows.get(ticket.mediaId);
      expect(row).toMatchObject({
        purpose: 'catalog.product-image',
        visibility: 'public',
        bucket: 'example-public',
        objectKey: `catalog/product-image/2026/11/14/${ticket.mediaId}`,
        status: 'pending',
        originalFileName: 'my photo.webp',
        ownerId: null,
        expiresAt: new Date(NOW + TTL_SECONDS * 1_000),
      });
      expect(ticket.confirmBy).toEqual(new Date(NOW + TTL_SECONDS * 1_000));
      expect(ticket.expiresAt).toEqual(new Date(NOW + 300_000));
      expect(ticket.fields).toMatchObject({
        key: row?.objectKey,
        'Content-Type': 'image/webp',
      });
    });

    it('never puts the client file name in the key', async () => {
      const context = setup();

      const ticket = await context.service.requestUpload({
        purpose: 'vendor.document',
        contentType: 'application/pdf',
        fileName: 'contract.pdf',
      });

      expect(ticket.fields.key).not.toContain('contract');
      expect(ticket.fields.key).toMatch(
        /^vendor\/document\/2026\/11\/14\/[0-9a-f-]{36}$/,
      );
      expect(context.client.rows.get(ticket.mediaId)?.bucket).toBe(
        'example-private',
      );
    });

    it('limits the upload to the purpose maximum at the storage side', async () => {
      const context = setup();
      const ticket = await context.service.requestUpload({
        purpose: 'catalog.product-image',
        contentType: 'image/png',
      });

      expect(
        context.storage.upload(ticket, {
          bytes: file(PNG, 5 * MEGABYTE + 1),
          contentType: 'image/png',
        }),
      ).toEqual({ accepted: false, code: 'EntityTooLarge' });
      expect(
        context.storage.upload(ticket, {
          bytes: file(PNG, 5 * MEGABYTE),
          contentType: 'image/png',
        }),
      ).toEqual({ accepted: true });
    });

    it('refuses a declared type the purpose does not accept, creating nothing', async () => {
      const context = setup();

      const error = await errorOf(
        context.service.requestUpload({
          purpose: 'catalog.product-image',
          contentType: 'application/pdf',
        }),
      );

      expect(error.code).toBe(ErrorCode.MEDIA_CONTENT_TYPE_NOT_ALLOWED);
      expect(error.details).toEqual({
        allowed: ['image/jpeg', 'image/png', 'image/webp'],
      });
      expect(context.client.rows.size).toBe(0);
      expect(context.storage.calls).toEqual([]);
    });
  });

  describe('confirmUpload', () => {
    it('makes a checked upload ready', async () => {
      const context = setup();
      const { mediaId } = await uploaded(context, file(JPEG, 2_048));

      const media = await context.service.confirmUpload(mediaId);

      expect(media).toMatchObject({
        id: mediaId,
        status: 'ready',
        sizeBytes: 2_048,
        contentType: 'image/jpeg',
        rejectionReason: null,
        confirmedAt: new Date(NOW),
      });
    });

    it('is idempotent: a second confirmation returns the same file without reading storage', async () => {
      const context = setup();
      const { mediaId } = await uploaded(context, file(JPEG));
      const first = await context.service.confirmUpload(mediaId);
      const callsAfterFirst = context.storage.calls.length;

      const second = await context.service.confirmUpload(mediaId);

      expect(second).toEqual(first);
      expect(context.storage.calls).toHaveLength(callsAfterFirst);
    });

    it.each([
      [
        'an executable renamed to .jpg',
        file(EXE),
        'image/jpeg',
        'catalog.product-image',
        'TYPE_NOT_ALLOWED',
      ],
      [
        'a PDF declared as PNG for an image purpose',
        file(PDF),
        'image/png',
        'catalog.product-image',
        'TYPE_NOT_ALLOWED',
      ],
      [
        'a PNG declared as JPEG',
        file(PNG),
        'image/jpeg',
        'catalog.product-image',
        'CONTENT_TYPE_MISMATCH',
      ],
      [
        'a truncated header',
        file(PNG.slice(0, 4), 4),
        'image/png',
        'catalog.product-image',
        'TYPE_NOT_ALLOWED',
      ],
    ] as const)(
      'rejects %s and deletes the object',
      async (_label, bytes, contentType, purpose, reason) => {
        const context = setup();
        const { mediaId, location } = await uploaded(context, bytes, {
          purpose,
          contentType,
        });

        const error = await errorOf(context.service.confirmUpload(mediaId));

        expect(error.code).toBe(ErrorCode.MEDIA_UPLOAD_REJECTED);
        expect(error.details).toEqual({ reason });
        expect(context.storage.hasObject(location)).toBe(false);
        expect(context.client.rows.get(mediaId)).toMatchObject({
          status: 'rejected',
          rejectionReason: reason,
        });
      },
    );

    it('rejects a confirmation with nothing uploaded', async () => {
      const context = setup();
      const ticket = await context.service.requestUpload({
        purpose: 'vendor.document',
        contentType: 'application/pdf',
      });

      const error = await errorOf(
        context.service.confirmUpload(ticket.mediaId),
      );

      expect(error.details).toEqual({ reason: 'OBJECT_MISSING' });
    });

    it('rejects an empty object and an oversized one that bypassed the policy', async () => {
      const context = setup();
      for (const [bytes, reason] of [
        [new Uint8Array(), 'EMPTY_FILE'],
        [file(JPEG, 5 * MEGABYTE + 1), 'TOO_LARGE'],
      ] as const) {
        const ticket = await context.service.requestUpload({
          purpose: 'catalog.product-image',
          contentType: 'image/jpeg',
        });
        const location = {
          bucket: 'example-public',
          key: String(ticket.fields.key),
        };
        context.storage.putObject(location, bytes, 'image/jpeg');

        const error = await errorOf(
          context.service.confirmUpload(ticket.mediaId),
        );

        expect(error.details).toEqual({ reason });
        expect(context.storage.hasObject(location)).toBe(false);
      }
    });

    it('is idempotent for a rejection too', async () => {
      const context = setup();
      const { mediaId } = await uploaded(context, file(EXE));
      await errorOf(context.service.confirmUpload(mediaId));
      const callsAfterFirst = context.storage.calls.length;

      const again = await errorOf(context.service.confirmUpload(mediaId));

      expect(again.code).toBe(ErrorCode.MEDIA_UPLOAD_REJECTED);
      expect(again.details).toEqual({ reason: 'TYPE_NOT_ALLOWED' });
      expect(context.storage.calls).toHaveLength(callsAfterFirst);
    });

    it('fails with MEDIA_NOT_FOUND for an unknown id', async () => {
      const context = setup();

      const error = await errorOf(
        context.service.confirmUpload('00000000-0000-4000-8000-000000000000'),
      );

      expect(error.code).toBe(ErrorCode.MEDIA_NOT_FOUND);
    });

    it('fails with MEDIA_UPLOAD_EXPIRED once the confirm window has passed, deleting nothing', async () => {
      const context = setup();
      const { mediaId, location } = await uploaded(context, file(JPEG));
      jest.setSystemTime(NOW + TTL_SECONDS * 1_000);

      const error = await errorOf(context.service.confirmUpload(mediaId));

      expect(error.code).toBe(ErrorCode.MEDIA_UPLOAD_EXPIRED);
      expect(context.storage.hasObject(location)).toBe(true);
      expect(context.client.rows.get(mediaId)?.status).toBe('pending');
    });

    it('leaves the row pending when the storage fails, so it can be confirmed again', async () => {
      const context = setup();
      const { mediaId } = await uploaded(context, file(JPEG));
      context.storage.failNext(
        'getObjectMetadata',
        new StorageError('unavailable'),
      );

      const error = await errorOf(context.service.confirmUpload(mediaId));

      expect(error).toBeInstanceOf(StorageError);
      expect(error.code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
      expect(context.client.rows.get(mediaId)?.status).toBe('pending');
      await expect(
        context.service.confirmUpload(mediaId),
      ).resolves.toMatchObject({ status: 'ready' });
    });

    it('leaves the row pending when deleting a rejected object fails', async () => {
      const context = setup();
      const { mediaId, location } = await uploaded(context, file(EXE));
      context.storage.failNext('deleteObject', new StorageError('unavailable'));

      await errorOf(context.service.confirmUpload(mediaId));

      expect(context.client.rows.get(mediaId)?.status).toBe('pending');
      expect(context.storage.hasObject(location)).toBe(true);
    });
  });

  describe('getDownloadLink', () => {
    it('gives a public file its stable URL, with no expiry', async () => {
      const context = setup();
      const { mediaId, location } = await uploaded(context, file(JPEG));
      await context.service.confirmUpload(mediaId);

      await expect(context.service.getDownloadLink(mediaId)).resolves.toEqual({
        url: `https://cdn.example.invalid/${location.key}`,
        expiresAt: null,
      });
    });

    it('gives a private file a presigned GET that expires', async () => {
      const context = setup();
      const { mediaId, location } = await uploaded(context, file(PDF), {
        purpose: 'vendor.document',
        contentType: 'application/pdf',
      });
      await context.service.confirmUpload(mediaId);

      const link = await context.service.getDownloadLink(mediaId);

      expect(link.expiresAt).toEqual(new Date(NOW + 600_000));
      expect(link.url).toContain(location.key);
      expect(context.storage.calls.at(-1)).toEqual({
        operation: 'createPresignedDownload',
        location,
      });
    });

    it('refuses a file that is not ready, and an unknown one', async () => {
      const context = setup();
      const { mediaId } = await uploaded(context, file(JPEG));

      expect(
        (await errorOf(context.service.getDownloadLink(mediaId))).code,
      ).toBe(ErrorCode.MEDIA_NOT_READY);
      expect(
        (
          await errorOf(
            context.service.getDownloadLink(
              '00000000-0000-4000-8000-000000000000',
            ),
          )
        ).code,
      ).toBe(ErrorCode.MEDIA_NOT_FOUND);
    });
  });

  describe('removeExpiredUploads', () => {
    it('removes only expired pending uploads: object and row', async () => {
      const context = setup();
      const expired = await uploaded(context, file(JPEG));
      jest.setSystemTime(NOW + 60_000);
      const fresh = await uploaded(context, file(JPEG));
      const ready = await uploaded(context, file(JPEG));
      await context.service.confirmUpload(ready.mediaId);
      jest.setSystemTime(NOW + TTL_SECONDS * 1_000 + 1);

      await expect(context.service.removeExpiredUploads()).resolves.toBe(1);

      expect(context.client.rows.has(expired.mediaId)).toBe(false);
      expect(context.storage.hasObject(expired.location)).toBe(false);
      expect(context.client.rows.get(fresh.mediaId)?.status).toBe('pending');
      expect(context.storage.hasObject(fresh.location)).toBe(true);
      expect(context.client.rows.get(ready.mediaId)?.status).toBe('ready');
    });

    it('is idempotent: running twice removes each upload once', async () => {
      const context = setup();
      await uploaded(context, file(JPEG));
      jest.setSystemTime(NOW + TTL_SECONDS * 1_000 + 1);

      await expect(context.service.removeExpiredUploads()).resolves.toBe(1);
      await expect(context.service.removeExpiredUploads()).resolves.toBe(0);
    });

    it('removes the row of an upload whose object never arrived', async () => {
      const context = setup();
      const ticket = await context.service.requestUpload({
        purpose: 'vendor.document',
        contentType: 'application/pdf',
      });
      jest.setSystemTime(NOW + TTL_SECONDS * 1_000 + 1);

      await expect(context.service.removeExpiredUploads()).resolves.toBe(1);
      expect(context.client.rows.has(ticket.mediaId)).toBe(false);
    });

    it('finishes after a failed run, and a confirmation meanwhile sees EXPIRED', async () => {
      const context = setup();
      const { mediaId, location } = await uploaded(context, file(JPEG));
      jest.setSystemTime(NOW + TTL_SECONDS * 1_000 + 1);
      context.storage.failNext('deleteObject', new StorageError('unavailable'));

      await expect(
        context.service.removeExpiredUploads(),
      ).rejects.toBeInstanceOf(StorageError);
      expect(context.client.rows.get(mediaId)).toMatchObject({
        status: 'rejected',
        rejectionReason: 'EXPIRED',
      });
      expect((await errorOf(context.service.confirmUpload(mediaId))).code).toBe(
        ErrorCode.MEDIA_UPLOAD_EXPIRED,
      );

      await expect(context.service.removeExpiredUploads()).resolves.toBe(1);
      expect(context.storage.hasObject(location)).toBe(false);
    });

    it('works through more expired uploads than one batch', async () => {
      const context = setup();
      for (let index = 0; index < 150; index += 1) {
        context.client.seed({
          id: `id-${index}`,
          bucket: 'example-private',
          objectKey: `k-${index}`,
          status: 'pending',
          rejectionReason: null,
          expiresAt: new Date(NOW - 1),
        });
      }

      await expect(context.service.removeExpiredUploads()).resolves.toBe(150);
      expect(context.client.rows.size).toBe(0);
    });

    it('stops between uploads once aborted', async () => {
      const context = setup();
      await uploaded(context, file(JPEG));
      jest.setSystemTime(NOW + TTL_SECONDS * 1_000 + 1);
      const controller = new AbortController();
      controller.abort(new Error('shutting down'));

      await expect(
        context.service.removeExpiredUploads(controller.signal),
      ).rejects.toThrow('shutting down');
    });
  });
});
