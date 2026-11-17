import type { MediaConfig } from '@config/media-config.type';
import type { StorageConfig } from '@config/storage-config.type';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { DbContext } from '@infra/database/db-context';
import type { RateLimiter } from '@infra/rate-limit/rate-limiter';
import {
  StorageError,
  StorageService,
  type PresignedUpload,
} from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { InMemoryMediaClient } from './in-memory-media-client.fake';
import type { MediaCleanupScope } from './media-cleanup-scope.type';
import { MEDIA_RATE_LIMITS } from './media-rate-limits.constants';
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
const AFTER_EXPIRY = NOW + TTL_SECONDS * 1_000 + 1;
/** An id no file has. */
const UNKNOWN_ID = '00000000-0000-4000-8000-0000000000ff';

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

/**
 * The service as production builds it (no cleanup scope), or limited to `scope`. The
 * rate limiter records each count and refuses with `refuseWith` once that is set.
 */
function setup(scope: MediaCleanupScope | null = null) {
  const client = new InMemoryMediaClient();
  const storage = new FakeStorageProvider(() => Date.now());
  const limits = {
    counted: [] as Array<{ name: string; key: string }>,
    refuseWith: null as AppError | null,
  };
  const rateLimiter = {
    consume: (options: { name: string }, key: string) => {
      limits.counted.push({ name: options.name, key });
      return limits.refuseWith === null
        ? Promise.resolve()
        : Promise.reject(limits.refuseWith);
    },
  };
  const service = new MediaService(
    { client } as unknown as DbContext,
    new StorageService(storage, STORAGE_CONFIG),
    MEDIA_CONFIG,
    scope,
    rateLimiter as unknown as RateLimiter,
  );
  return { service, client, storage, limits };
}

type Context = ReturnType<typeof setup>;

/** Requests an upload and plays the client's POST with `bytes`. */
async function uploaded(
  context: Context,
  bytes: Uint8Array,
  options: {
    purpose?: 'catalog.product-image' | 'vendor.document' | 'vendor.logo';
    contentType?: string;
    ownerId?: string;
  } = {},
): Promise<{
  mediaId: string;
  ticket: PresignedUpload;
  /** Where the ticket writes: the staging object. */
  staging: { bucket: string; key: string };
}> {
  const contentType = options.contentType ?? 'image/jpeg';
  const ticket = await context.service.requestUpload({
    purpose: options.purpose ?? 'catalog.product-image',
    contentType,
    ownerId: options.ownerId,
  });
  expect(context.storage.upload(ticket, { bytes, contentType })).toEqual({
    accepted: true,
  });
  return {
    mediaId: ticket.mediaId,
    ticket,
    staging: {
      bucket: String(ticket.fields.bucket),
      key: String(ticket.fields.key),
    },
  };
}

/** The location of a ready row's checked copy. */
function finalLocation(
  context: Context,
  mediaId: string,
): { bucket: string; key: string } {
  const row = context.client.rows.get(mediaId);
  return { bucket: String(row?.bucket), key: String(row?.objectKey) };
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
    it('creates a pending row and a ticket for a staging key in the private bucket', async () => {
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
        bucket: null,
        objectKey: null,
        stagingKey: `staging/catalog/product-image/2026/11/14/${ticket.mediaId}`,
        status: 'pending',
        originalFileName: 'my photo.webp',
        ownerId: null,
        expiresAt: new Date(NOW + TTL_SECONDS * 1_000),
      });
      expect(ticket.confirmBy).toEqual(new Date(NOW + TTL_SECONDS * 1_000));
      expect(ticket.expiresAt).toEqual(new Date(NOW + 300_000));
      // A public purpose still uploads to the private bucket: nothing unchecked is public.
      expect(ticket.fields).toMatchObject({
        bucket: 'example-private',
        key: row?.stagingKey,
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
        /^staging\/vendor\/document\/2026\/11\/14\/[0-9a-f-]{36}$/,
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

    it("counts each request against its owner's upload limit", async () => {
      const context = setup();

      await context.service.requestUpload({
        purpose: 'vendor.document',
        contentType: 'application/pdf',
        ownerId: 'user-1',
      });

      expect(context.limits.counted).toEqual([
        { name: MEDIA_RATE_LIMITS.owner.name, key: 'user-1' },
      ]);
    });

    it('refuses an owner over the limit, creating nothing', async () => {
      const context = setup();
      context.limits.refuseWith = new AppError(ErrorCode.RATE_LIMITED, {
        retryAfterSeconds: 60,
      });

      const error = await errorOf(
        context.service.requestUpload({
          purpose: 'vendor.document',
          contentType: 'application/pdf',
          ownerId: 'user-1',
        }),
      );

      expect(error.code).toBe(ErrorCode.RATE_LIMITED);
      expect(context.client.rows.size).toBe(0);
      expect(context.storage.calls).toEqual([]);
    });
  });

  describe('confirmUpload', () => {
    it('copies a checked upload to a final key in the purpose bucket and makes it ready', async () => {
      const context = setup();
      const { mediaId, staging } = await uploaded(context, file(JPEG, 2_048));

      const media = await context.service.confirmUpload(mediaId);

      expect(media).toMatchObject({
        id: mediaId,
        status: 'ready',
        sizeBytes: 2_048,
        contentType: 'image/jpeg',
        rejectionReason: null,
        confirmedAt: new Date(NOW),
      });
      const final = finalLocation(context, mediaId);
      expect(final.bucket).toBe('example-public');
      expect(final.key).toMatch(
        new RegExp(
          `^catalog/product-image/2026/11/14/${mediaId}/[0-9a-f-]{36}$`,
        ),
      );
      // Only the checked copy is left: the staging object is deleted.
      expect(context.storage.objectLocations()).toEqual([
        `${final.bucket}/${final.key}`,
      ]);
      expect(context.storage.hasObject(staging)).toBe(false);
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
      'rejects %s and deletes the staging object and the copy',
      async (_label, bytes, contentType, purpose, reason) => {
        const context = setup();
        const { mediaId } = await uploaded(context, bytes, {
          purpose,
          contentType,
        });

        const error = await errorOf(context.service.confirmUpload(mediaId));

        expect(error.code).toBe(ErrorCode.MEDIA_UPLOAD_REJECTED);
        expect(error.details).toEqual({ reason });
        expect(context.storage.objectLocations()).toEqual([]);
        expect(context.client.rows.get(mediaId)).toMatchObject({
          status: 'rejected',
          rejectionReason: reason,
          bucket: null,
          objectKey: null,
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
      expect(context.storage.objectLocations()).toEqual([]);
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
        const staging = {
          bucket: 'example-private',
          key: String(ticket.fields.key),
        };
        context.storage.putObject(staging, bytes, 'image/jpeg');

        const error = await errorOf(
          context.service.confirmUpload(ticket.mediaId),
        );

        expect(error.details).toEqual({ reason });
        expect(context.storage.objectLocations()).toEqual([]);
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
      const { mediaId, staging } = await uploaded(context, file(JPEG));
      jest.setSystemTime(NOW + TTL_SECONDS * 1_000);

      const error = await errorOf(context.service.confirmUpload(mediaId));

      expect(error.code).toBe(ErrorCode.MEDIA_UPLOAD_EXPIRED);
      expect(context.storage.hasObject(staging)).toBe(true);
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
      const { mediaId, staging } = await uploaded(context, file(EXE));
      context.storage.failNext('deleteObject', new StorageError('unavailable'));

      await errorOf(context.service.confirmUpload(mediaId));

      expect(context.client.rows.get(mediaId)?.status).toBe('pending');
      expect(context.storage.hasObject(staging)).toBe(true);
    });
  });

  describe('a reused upload ticket cannot change a checked file (review of #230)', () => {
    it('a re-upload after confirmation reaches only the staging key, never the checked copy', async () => {
      const context = setup();
      const { mediaId, ticket, staging } = await uploaded(context, file(JPEG));
      await context.service.confirmUpload(mediaId);
      const final = finalLocation(context, mediaId);

      // The ticket is still valid: the storage accepts the second POST.
      expect(
        context.storage.upload(ticket, {
          bytes: file(EXE, 4_096),
          contentType: 'image/jpeg',
        }),
      ).toEqual({ accepted: true });

      expect(context.storage.objectBytes(final)).toEqual(file(JPEG));
      expect(context.storage.objectBytes(staging)).toEqual(file(EXE, 4_096));
      expect(context.client.rows.get(mediaId)).toMatchObject({
        status: 'ready',
        sizeBytes: 64,
        detectedContentType: 'image/jpeg',
      });
      await expect(context.service.getDownloadLink(mediaId)).resolves.toEqual({
        url: `https://cdn.example.invalid/${final.key}`,
        expiresAt: null,
      });
    });

    it('a re-upload after rejection stays unread, and the cleanup removes it once the ticket expired', async () => {
      const context = setup();
      const { mediaId, ticket, staging } = await uploaded(context, file(EXE));
      await errorOf(context.service.confirmUpload(mediaId));

      expect(
        context.storage.upload(ticket, {
          bytes: file(JPEG),
          contentType: 'image/jpeg',
        }),
      ).toEqual({ accepted: true });
      expect(
        (await errorOf(context.service.confirmUpload(mediaId))).details,
      ).toEqual({ reason: 'TYPE_NOT_ALLOWED' });
      await context.service.removeExpiredUploads();
      expect(context.storage.hasObject(staging)).toBe(true);

      jest.setSystemTime(AFTER_EXPIRY);
      await context.service.removeExpiredUploads();

      expect(context.storage.objectLocations()).toEqual([]);
      expect(context.client.rows.get(mediaId)).toMatchObject({
        status: 'rejected',
        rejectionReason: 'TYPE_NOT_ALLOWED',
        stagingKey: null,
      });
    });

    it('two confirmations with a re-upload between them leave the winner ready with its copy', async () => {
      const context = setup();
      const { mediaId, ticket } = await uploaded(context, file(EXE));
      // Confirmation A rejects the executable and waits at the delete of its copy.
      const gate = context.storage.pause('deleteObject');
      const confirmationA = context.service.confirmUpload(mediaId);
      await gate.reached;

      context.storage.upload(ticket, {
        bytes: file(JPEG),
        contentType: 'image/jpeg',
      });
      const confirmationB = await context.service.confirmUpload(mediaId);
      gate.release();
      const outcomeA = await confirmationA;

      expect(confirmationB).toMatchObject({ status: 'ready' });
      // A lost the conditional update and answers with the row as B left it: the ready
      // file, not its own rejection.
      expect(outcomeA).toEqual(confirmationB);
      expect(context.client.rows.get(mediaId)?.status).toBe('ready');
      const final = finalLocation(context, mediaId);
      expect(context.storage.objectBytes(final)).toEqual(file(JPEG));
      expect(context.storage.objectLocations()).toEqual([
        `${final.bucket}/${final.key}`,
      ]);
    });
  });

  describe('concurrent state changes (conditional updates)', () => {
    it('confirm against confirm: one copy wins, the loser deletes its own copy', async () => {
      const context = setup();
      const { mediaId } = await uploaded(context, file(JPEG));
      const gate = context.storage.pause('getObjectMetadata');
      const confirmationA = context.service.confirmUpload(mediaId);
      await gate.reached;

      const confirmationB = await context.service.confirmUpload(mediaId);
      const winner = finalLocation(context, mediaId);
      gate.release();
      const outcomeA = await confirmationA;

      expect(outcomeA).toEqual(confirmationB);
      expect(finalLocation(context, mediaId)).toEqual(winner);
      expect(context.storage.objectLocations()).toEqual([
        `${winner.bucket}/${winner.key}`,
      ]);
    });

    it('confirm against the cleanup claim: the claim wins and nothing is left', async () => {
      const context = setup();
      const { mediaId } = await uploaded(context, file(JPEG));
      jest.setSystemTime(AFTER_EXPIRY - 2);
      const confirmGate = context.storage.pause('getObjectMetadata');
      const confirmation = errorOf(context.service.confirmUpload(mediaId));
      await confirmGate.reached;

      jest.setSystemTime(AFTER_EXPIRY);
      const cleanupGate = context.storage.pause('deleteObject');
      const cleanup = context.service.removeExpiredUploads();
      await cleanupGate.reached;
      expect(context.client.rows.get(mediaId)).toMatchObject({
        status: 'rejected',
        rejectionReason: 'EXPIRED',
      });

      confirmGate.release();
      const error = await confirmation;
      cleanupGate.release();
      await expect(cleanup).resolves.toBe(1);

      expect(error.code).toBe(ErrorCode.MEDIA_UPLOAD_EXPIRED);
      expect(context.client.rows.has(mediaId)).toBe(false);
      expect(context.storage.objectLocations()).toEqual([]);
    });
  });

  describe('confirmOwnUpload', () => {
    const OWNER = '00000000-0000-4000-8000-000000000001';
    const STRANGER = '00000000-0000-4000-8000-000000000002';

    it("confirms the owner's file", async () => {
      const context = setup();
      const { mediaId } = await uploaded(context, file(JPEG), {
        ownerId: OWNER,
      });

      await expect(
        context.service.confirmOwnUpload(mediaId, OWNER),
      ).resolves.toMatchObject({
        id: mediaId,
        status: 'ready',
        ownerId: OWNER,
      });
    });

    it("answers another user's file and a file with no owner exactly like a missing one", async () => {
      const context = setup();
      const owned = await uploaded(context, file(JPEG), { ownerId: OWNER });
      const unowned = await uploaded(context, file(JPEG));

      for (const mediaId of [owned.mediaId, unowned.mediaId, UNKNOWN_ID]) {
        expect(
          (await errorOf(context.service.confirmOwnUpload(mediaId, STRANGER)))
            .code,
        ).toBe(ErrorCode.MEDIA_NOT_FOUND);
      }
      expect(context.client.rows.get(owned.mediaId)?.status).toBe('pending');
    });
  });

  describe('findFiles', () => {
    it('returns the files that exist, in any status, and none for no ids', async () => {
      const context = setup();
      const ready = await uploaded(context, file(JPEG));
      await context.service.confirmUpload(ready.mediaId);
      const pending = await uploaded(context, file(JPEG));

      const found = await context.service.findFiles([
        ready.mediaId,
        pending.mediaId,
        UNKNOWN_ID,
      ]);

      expect(found.map((each) => [each.id, each.status]).sort()).toEqual(
        [
          [ready.mediaId, 'ready'],
          [pending.mediaId, 'pending'],
        ].sort(),
      );
      await expect(context.service.findFiles([])).resolves.toEqual([]);
    });
  });

  describe('getPublicUrls', () => {
    it('maps each ready public file to its stable URL without calling the storage', async () => {
      const context = setup();
      const logo = await uploaded(context, file(PNG), {
        purpose: 'vendor.logo',
        contentType: 'image/png',
      });
      await context.service.confirmUpload(logo.mediaId);
      const document = await uploaded(context, file(PDF), {
        purpose: 'vendor.document',
        contentType: 'application/pdf',
      });
      await context.service.confirmUpload(document.mediaId);
      const pending = await uploaded(context, file(PNG), {
        purpose: 'vendor.logo',
        contentType: 'image/png',
      });
      const callsBefore = context.storage.calls.length;

      const urls = await context.service.getPublicUrls([
        logo.mediaId,
        logo.mediaId,
        document.mediaId,
        pending.mediaId,
        UNKNOWN_ID,
      ]);

      const final = finalLocation(context, logo.mediaId);
      expect([...urls]).toEqual([
        [logo.mediaId, `https://cdn.example.invalid/${final.key}`],
      ]);
      expect(context.storage.calls).toHaveLength(callsBefore);
      await expect(context.service.getPublicUrls([])).resolves.toEqual(
        new Map(),
      );
    });
  });

  describe('getDownloadLink', () => {
    it('gives a public file the stable URL of its checked copy, with no expiry', async () => {
      const context = setup();
      const { mediaId } = await uploaded(context, file(JPEG));
      await context.service.confirmUpload(mediaId);

      await expect(context.service.getDownloadLink(mediaId)).resolves.toEqual({
        url: `https://cdn.example.invalid/${finalLocation(context, mediaId).key}`,
        expiresAt: null,
      });
    });

    it('gives a private file a presigned GET that expires', async () => {
      const context = setup();
      const { mediaId } = await uploaded(context, file(PDF), {
        purpose: 'vendor.document',
        contentType: 'application/pdf',
      });
      await context.service.confirmUpload(mediaId);
      const final = finalLocation(context, mediaId);

      const link = await context.service.getDownloadLink(mediaId);

      expect(final.bucket).toBe('example-private');
      expect(link.expiresAt).toEqual(new Date(NOW + 600_000));
      expect(link.url).toContain(final.key);
      expect(context.storage.calls.at(-1)).toEqual({
        operation: 'createPresignedDownload',
        location: final,
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

  describe('discardOwnFiles', () => {
    const OWNER = '00000000-0000-4000-8000-0000000000a1';
    const OTHER = '00000000-0000-4000-8000-0000000000a2';
    const document = (context: Context, ownerId: string) =>
      uploaded(context, file(PDF), {
        purpose: 'vendor.document',
        contentType: 'application/pdf',
        ownerId,
      });

    it("marks the owner's files of the purpose, except those kept; the cleanup removes a ready copy at once, the rest once the window ended", async () => {
      const context = setup();
      const ready = await document(context, OWNER);
      await context.service.confirmUpload(ready.mediaId);
      const pending = await document(context, OWNER);
      const kept = await document(context, OWNER);
      await context.service.confirmUpload(kept.mediaId);
      const others = await document(context, OTHER);
      const image = await uploaded(context, file(JPEG), { ownerId: OWNER });
      const readyCopy = finalLocation(context, ready.mediaId);

      await expect(
        context.service.discardOwnFiles(OWNER, 'vendor.document', [
          kept.mediaId,
        ]),
      ).resolves.toBe(2);
      for (const marked of [ready, pending]) {
        expect(context.client.rows.get(marked.mediaId)).toMatchObject({
          status: 'rejected',
          rejectionReason: 'OWNER_DELETED',
        });
      }
      // Nothing is removed from storage until the cleanup runs (after the commit).
      expect(context.storage.hasObject(readyCopy)).toBe(true);

      await expect(context.service.removeExpiredUploads()).resolves.toBe(0);

      // Inside the window: the checked copy goes, the rows and staging objects stay.
      expect(context.storage.hasObject(readyCopy)).toBe(false);
      expect(context.client.rows.get(ready.mediaId)).toMatchObject({
        bucket: null,
        objectKey: null,
      });
      expect(context.storage.hasObject(pending.staging)).toBe(true);
      expect(context.client.rows.get(kept.mediaId)?.status).toBe('ready');
      expect(context.client.rows.get(others.mediaId)?.status).toBe('pending');
      expect(context.client.rows.get(image.mediaId)?.status).toBe('pending');

      jest.setSystemTime(AFTER_EXPIRY);
      await context.service.removeExpiredUploads();

      expect(context.client.rows.has(ready.mediaId)).toBe(false);
      expect(context.client.rows.has(pending.mediaId)).toBe(false);
      expect(context.storage.hasObject(ready.staging)).toBe(false);
      expect(context.storage.hasObject(pending.staging)).toBe(false);
      expect(context.client.rows.get(kept.mediaId)?.status).toBe('ready');
    });

    it('keeps a marked row while its upload ticket is valid, so a late upload is removed too (review of #240)', async () => {
      const context = setup();
      const pending = await document(context, OWNER);
      await context.service.discardOwnFiles(OWNER, 'vendor.document', []);
      await context.service.removeExpiredUploads();
      expect(context.client.rows.has(pending.mediaId)).toBe(true);

      expect(
        context.storage.upload(pending.ticket, {
          bytes: file(PDF),
          contentType: 'application/pdf',
        }),
      ).toEqual({ accepted: true });
      jest.setSystemTime(AFTER_EXPIRY);
      await expect(context.service.removeExpiredUploads()).resolves.toBe(1);

      expect(context.client.rows.has(pending.mediaId)).toBe(false);
      expect(context.storage.objectLocations()).toEqual([]);
    });

    it('also marks a file that failed its checks, so its row and file name go', async () => {
      const context = setup();
      const failed = await uploaded(context, file(EXE), {
        purpose: 'vendor.document',
        contentType: 'application/pdf',
        ownerId: OWNER,
      });
      await errorOf(context.service.confirmUpload(failed.mediaId));
      expect(context.client.rows.get(failed.mediaId)?.status).toBe('rejected');

      await expect(
        context.service.discardOwnFiles(OWNER, 'vendor.document', []),
      ).resolves.toBe(1);
      jest.setSystemTime(AFTER_EXPIRY);
      await context.service.removeExpiredUploads();

      expect(context.client.rows.has(failed.mediaId)).toBe(false);
    });

    it('turns a later confirmation of a marked upload into MEDIA_UPLOAD_REJECTED', async () => {
      const context = setup();
      const pending = await document(context, OWNER);
      await context.service.discardOwnFiles(OWNER, 'vendor.document', []);

      const error = await errorOf(
        context.service.confirmUpload(pending.mediaId),
      );

      expect(error.code).toBe(ErrorCode.MEDIA_UPLOAD_REJECTED);
      expect(error.details).toEqual({ reason: 'OWNER_DELETED' });
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
      jest.setSystemTime(AFTER_EXPIRY);

      await expect(context.service.removeExpiredUploads()).resolves.toBe(1);

      expect(context.client.rows.has(expired.mediaId)).toBe(false);
      expect(context.storage.hasObject(expired.staging)).toBe(false);
      expect(context.client.rows.get(fresh.mediaId)?.status).toBe('pending');
      expect(context.storage.hasObject(fresh.staging)).toBe(true);
      expect(context.client.rows.get(ready.mediaId)?.status).toBe('ready');
    });

    it('with a scope, acts only on the uploads of its owner', async () => {
      const owner = '00000000-0000-4000-8000-000000000001';
      const context = setup({ ownerId: owner });
      const own = await uploaded(context, file(JPEG));
      const unowned = await uploaded(context, file(JPEG));
      const other = await uploaded(context, file(JPEG));
      const ownReady = await uploaded(context, file(JPEG));
      const unownedReady = await uploaded(context, file(JPEG));
      for (const ready of [ownReady, unownedReady]) {
        await context.service.confirmUpload(ready.mediaId);
        // A re-upload with the still valid ticket: a staging object the cleanup removes.
        context.storage.upload(ready.ticket, {
          bytes: file(JPEG),
          contentType: 'image/jpeg',
        });
      }
      const assign = (mediaId: string, ownerId: string): void => {
        const row = context.client.rows.get(mediaId);
        if (row !== undefined) {
          row.ownerId = ownerId;
        }
      };
      assign(own.mediaId, owner);
      assign(ownReady.mediaId, owner);
      assign(other.mediaId, '00000000-0000-4000-8000-000000000002');
      jest.setSystemTime(AFTER_EXPIRY);

      await expect(context.service.removeExpiredUploads()).resolves.toBe(1);

      expect(context.client.rows.has(own.mediaId)).toBe(false);
      expect(context.storage.hasObject(own.staging)).toBe(false);
      for (const untouched of [unowned, other]) {
        expect(context.client.rows.get(untouched.mediaId)?.status).toBe(
          'pending',
        );
        expect(context.storage.hasObject(untouched.staging)).toBe(true);
      }
      expect(context.storage.hasObject(ownReady.staging)).toBe(false);
      expect(context.storage.hasObject(unownedReady.staging)).toBe(true);
    });

    it('removes the staging object of a ready upload only once its ticket expired', async () => {
      const context = setup();
      const { mediaId, ticket, staging } = await uploaded(context, file(JPEG));
      await context.service.confirmUpload(mediaId);
      context.storage.upload(ticket, {
        bytes: file(JPEG),
        contentType: 'image/jpeg',
      });

      await context.service.removeExpiredUploads();
      expect(context.storage.hasObject(staging)).toBe(true);
      jest.setSystemTime(AFTER_EXPIRY);
      await expect(context.service.removeExpiredUploads()).resolves.toBe(0);

      expect(context.storage.hasObject(staging)).toBe(false);
      expect(context.storage.hasObject(finalLocation(context, mediaId))).toBe(
        true,
      );
      expect(context.client.rows.get(mediaId)).toMatchObject({
        status: 'ready',
        stagingKey: null,
      });
    });

    it('is idempotent: running twice removes each upload once', async () => {
      const context = setup();
      await uploaded(context, file(JPEG));
      jest.setSystemTime(AFTER_EXPIRY);

      await expect(context.service.removeExpiredUploads()).resolves.toBe(1);
      await expect(context.service.removeExpiredUploads()).resolves.toBe(0);
    });

    it('removes the row of an upload whose object never arrived', async () => {
      const context = setup();
      const ticket = await context.service.requestUpload({
        purpose: 'vendor.document',
        contentType: 'application/pdf',
      });
      jest.setSystemTime(AFTER_EXPIRY);

      await expect(context.service.removeExpiredUploads()).resolves.toBe(1);
      expect(context.client.rows.has(ticket.mediaId)).toBe(false);
    });

    it('finishes after a failed run, and a confirmation meanwhile sees EXPIRED', async () => {
      const context = setup();
      const { mediaId, staging } = await uploaded(context, file(JPEG));
      jest.setSystemTime(AFTER_EXPIRY);
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
      expect(context.storage.hasObject(staging)).toBe(false);
    });

    it('works through more expired uploads than one batch', async () => {
      const context = setup();
      for (let index = 0; index < 150; index += 1) {
        context.client.seed({
          id: `id-${index}`,
          stagingKey: `staging/k-${index}`,
          bucket: null,
          objectKey: null,
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
      jest.setSystemTime(AFTER_EXPIRY);
      const controller = new AbortController();
      controller.abort(new Error('shutting down'));

      await expect(
        context.service.removeExpiredUploads(controller.signal),
      ).rejects.toThrow('shutting down');
    });
  });
});
