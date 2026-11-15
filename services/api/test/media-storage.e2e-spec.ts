import { getQueueToken } from '@nestjs/bullmq';
import type { INestApplication } from '@nestjs/common';
import type { Job, Queue } from 'bullmq';
import request from 'supertest';
import type { App } from 'supertest/types';
import { loadEnv } from '@config/load-env';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { PrismaService } from '@infra/database/prisma.service';
import { QUEUE_NAMES } from '@infra/queue/queue-names.constants';
import { StorageService } from '@integrations/storage';
import { MEDIA_CLEANUP_SCOPE } from '../src/modules/media/media-cleanup-scope.constants';
import type { MediaCleanupScope } from '../src/modules/media/media-cleanup-scope.type';
import { MEDIA_CLEANUP } from '../src/modules/media/media-cleanup.constants';
import { MediaCleanupProcessor } from '../src/modules/media/media-cleanup.processor';
import { MediaCleanupScheduler } from '../src/modules/media/media-cleanup.scheduler';
import { createHttpApp } from './support/create-http-app';
import { MediaModule } from '@modules/media';
import { MediaProbeController } from './support/media-probe.controller';

jest.setTimeout(30_000);

type Ticket = { mediaId: string; url: string; fields: Record<string, string> };

const MEGABYTE = 1024 * 1024;
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37];
const EXE = [0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00];

function file(start: number[], size = 1_024): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(size);
  bytes.set(start);
  // Something after the header, so a read back proves the whole file arrived.
  bytes[size - 1] = 0x7e;
  return bytes;
}

/**
 * The storage side, against the local MinIO (`pnpm infra:up`) and its -test buckets
 * (scripts/e2e.mjs): what the presigned POST policy really enforces, that uploads land in
 * a private staging key and only a checked copy is served, public and private reads, and
 * the cleanup job. Uploads are real multipart form POSTs, as a browser or the app sends
 * them.
 */
describe('Media uploads against MinIO (e2e)', () => {
  const env = loadEnv();
  const endpoint = env.STORAGE_ENDPOINT ?? '';
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storage: StorageService;
  const created: string[] = [];

  beforeAll(async () => {
    const reachable = await fetch(`${endpoint}/minio/health/live`).then(
      (res) => res.ok,
      () => false,
    );
    if (!reachable) {
      throw new Error(
        `MinIO is not running at ${endpoint}. Run \`pnpm infra:up\`, then run the e2e tests again.`,
      );
    }
    app = await createHttpApp({
      controllers: [MediaProbeController],
      imports: [MediaModule],
      // The cleanup's schedule and job are tested here.
      workers: [MediaCleanupScheduler, MediaCleanupProcessor],
    });
    prisma = app.get(PrismaService);
    storage = app.get(StorageService);
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    const rows = await prisma.media.findMany({
      where: { id: { in: created } },
    });
    for (const row of rows) {
      if (row.bucket !== null && row.objectKey !== null) {
        await storage.deleteObject({ bucket: row.bucket, key: row.objectKey });
      }
      if (row.stagingKey !== null) {
        await storage.deleteObject({
          bucket: env.STORAGE_PRIVATE_BUCKET,
          key: row.stagingKey,
        });
      }
    }
    await prisma.media.deleteMany({ where: { id: { in: created } } });
    await app.close();
  });

  async function requestUpload(
    purpose: string,
    contentType: string,
  ): Promise<Ticket> {
    const res = await request(app.getHttpServer())
      .post('/v1/test/media/uploads')
      .send({ purpose, contentType })
      .expect(201);
    const ticket = res.body as Ticket;
    created.push(ticket.mediaId);
    return ticket;
  }

  /** The client's upload: the ticket's form fields, then the file, last. */
  async function post(
    ticket: Ticket,
    bytes: Uint8Array<ArrayBuffer>,
    fields: Record<string, string> = ticket.fields,
  ): Promise<{ status: number; body: string }> {
    const form = new FormData();
    for (const [name, value] of Object.entries(fields)) {
      form.append(name, value);
    }
    form.append('file', new Blob([bytes]), 'upload.bin');
    const res = await fetch(ticket.url, { method: 'POST', body: form });
    return { status: res.status, body: await res.text() };
  }

  function confirm(id: string): request.Test {
    return request(app.getHttpServer()).post(`/v1/test/media/${id}/confirm`);
  }

  /** Where a ready file's checked copy is, from its row. */
  async function finalLocation(
    id: string,
  ): Promise<{ bucket: string; key: string }> {
    const row = await prisma.media.findUnique({ where: { id } });
    return { bucket: row?.bucket ?? '', key: row?.objectKey ?? '' };
  }

  /** Runs the cleanup job once, as its worker would. */
  async function runCleanup(): Promise<void> {
    const job = {
      id: 'e2e-cleanup',
      name: MEDIA_CLEANUP.jobName,
      data: {},
      queueName: QUEUE_NAMES.mediaCleanup,
    } as unknown as Job<unknown, number>;
    await app.get(MediaCleanupProcessor).process(job);
  }

  /**
   * Moves an upload's confirm window, and so its ticket, into the past, and gives it this
   * app's cleanup owner: the cleanup here acts only on that owner's uploads, and other
   * suites' cleanups never on them (createHttpApp, MEDIA_CLEANUP_SCOPE).
   */
  async function expire(id: string): Promise<void> {
    const scope = app.get<MediaCleanupScope>(MEDIA_CLEANUP_SCOPE);
    await prisma.media.update({
      where: { id },
      data: {
        expiresAt: new Date(Date.now() - 1_000),
        ownerId: scope.ownerId,
      },
    });
  }

  async function downloadLink(
    id: string,
  ): Promise<{ url: string; expiresAt: string | null }> {
    const res = await request(app.getHttpServer())
      .get(`/v1/test/media/${id}/download-link`)
      .expect(200);
    return res.body as { url: string; expiresAt: string | null };
  }

  it('the presigned POST really enforces the size limit at the storage side', async () => {
    const ticket = await requestUpload('catalog.product-image', 'image/jpeg');

    const oversized = await post(ticket, file(JPEG, 5 * MEGABYTE + 1));

    // The storage's own answer, printed as evidence that the limit is enforced there.
    console.log(
      `storage refused a ${5 * MEGABYTE + 1}-byte upload (limit ${5 * MEGABYTE}): HTTP ${oversized.status} ${/<Code>([^<]+)<\/Code>/.exec(oversized.body)?.[1] ?? oversized.body}`,
    );
    expect(oversized.status).toBe(400);
    expect(oversized.body).toContain('<Code>EntityTooLarge</Code>');
    await expect(
      storage.getObjectMetadata({
        bucket: ticket.fields.bucket ?? '',
        key: ticket.fields.key ?? '',
      }),
    ).resolves.toBeNull();

    // Exactly at the limit is accepted.
    expect((await post(ticket, file(JPEG, 5 * MEGABYTE))).status).toBe(204);
  });

  it('the presigned POST really enforces the content type at the storage side', async () => {
    const ticket = await requestUpload('catalog.product-image', 'image/jpeg');

    const retyped = await post(ticket, file(JPEG), {
      ...ticket.fields,
      'Content-Type': 'image/png',
    });

    expect(retyped.status).toBe(403);
    expect(retyped.body).toContain('<Code>AccessDenied</Code>');
    await expect(
      storage.getObjectMetadata({
        bucket: ticket.fields.bucket ?? '',
        key: ticket.fields.key ?? '',
      }),
    ).resolves.toBeNull();
  });

  it('the presigned POST cannot write to another key', async () => {
    const ticket = await requestUpload('catalog.product-image', 'image/jpeg');

    const moved = await post(ticket, file(JPEG), {
      ...ticket.fields,
      key: `${ticket.fields.key}-elsewhere`,
    });

    expect(moved.status).toBe(403);
  });

  it('an upload for a public purpose lands in the private bucket, unreadable until checked', async () => {
    const ticket = await requestUpload('catalog.product-image', 'image/jpeg');
    expect(ticket.fields.bucket).toBe(env.STORAGE_PRIVATE_BUCKET);
    expect((await post(ticket, file(JPEG))).status).toBe(204);

    const direct = await fetch(
      `${endpoint}/${ticket.fields.bucket}/${ticket.fields.key}`,
    );

    expect(direct.status).toBe(403);
  });

  it('a public object is reachable at its public URL after confirm', async () => {
    const ticket = await requestUpload('catalog.product-image', 'image/jpeg');
    const bytes = file(JPEG, 4_096);
    expect((await post(ticket, bytes)).status).toBe(204);
    await confirm(ticket.mediaId).expect(200);

    const link = await downloadLink(ticket.mediaId);
    const res = await fetch(link.url);
    const final = await finalLocation(ticket.mediaId);

    expect(link.expiresAt).toBeNull();
    expect(final.bucket).toBe(env.STORAGE_PUBLIC_BUCKET);
    expect(link.url).toBe(`${env.STORAGE_PUBLIC_BASE_URL}/${final.key}`);
    // The staging object is deleted once the copy is checked.
    await expect(
      storage.getObjectMetadata({
        bucket: ticket.fields.bucket ?? '',
        key: ticket.fields.key ?? '',
      }),
    ).resolves.toBeNull();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/jpeg');
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes);
  });

  it('a private object is not reachable without a presigned GET, and is reachable with one', async () => {
    const ticket = await requestUpload('vendor.document', 'application/pdf');
    const bytes = file(PDF, 2_048);
    expect((await post(ticket, bytes)).status).toBe(204);
    const confirmed = await confirm(ticket.mediaId).expect(200);
    expect(confirmed.body).toMatchObject({
      status: 'ready',
      visibility: 'private',
    });

    const final = await finalLocation(ticket.mediaId);
    const direct = await fetch(`${endpoint}/${final.bucket}/${final.key}`);
    expect(final.bucket).toBe(env.STORAGE_PRIVATE_BUCKET);
    expect(direct.status).toBe(403);

    const link = await downloadLink(ticket.mediaId);
    const signed = await fetch(link.url);
    expect(link.expiresAt).not.toBeNull();
    expect(signed.status).toBe(200);
    expect(new Uint8Array(await signed.arrayBuffer())).toEqual(bytes);
  });

  it('a file whose real type is not allowed is deleted from the storage at confirm', async () => {
    const ticket = await requestUpload('catalog.product-image', 'image/jpeg');
    expect((await post(ticket, file(EXE))).status).toBe(204);
    const location = {
      bucket: ticket.fields.bucket ?? '',
      key: ticket.fields.key ?? '',
    };
    await expect(storage.getObjectMetadata(location)).resolves.not.toBeNull();

    const res = await confirm(ticket.mediaId).expect(422);

    expect((res.body as ErrorResponseBody).details).toEqual({
      reason: 'TYPE_NOT_ALLOWED',
    });
    await expect(storage.getObjectMetadata(location)).resolves.toBeNull();
    await expect(
      prisma.media.findUnique({ where: { id: ticket.mediaId } }),
    ).resolves.toMatchObject({ bucket: null, objectKey: null });
  });

  describe('a reused upload ticket cannot change a checked file (review of #230)', () => {
    it('a second POST after confirmation does not change what is served', async () => {
      const ticket = await requestUpload('catalog.product-image', 'image/jpeg');
      const bytes = file(JPEG, 2_048);
      expect((await post(ticket, bytes)).status).toBe(204);
      await confirm(ticket.mediaId).expect(200);

      // The ticket is still valid, so the storage accepts an executable at the staging key.
      expect((await post(ticket, file(EXE, 4_096))).status).toBe(204);

      const served = await fetch((await downloadLink(ticket.mediaId)).url);
      expect(new Uint8Array(await served.arrayBuffer())).toEqual(bytes);
      await expect(
        storage.getObjectMetadata(await finalLocation(ticket.mediaId)),
      ).resolves.toEqual({ sizeBytes: 2_048, contentType: 'image/jpeg' });

      // Once the ticket has expired, the cleanup removes the staging object.
      await expire(ticket.mediaId);
      await runCleanup();
      await expect(
        storage.getObjectMetadata({
          bucket: ticket.fields.bucket ?? '',
          key: ticket.fields.key ?? '',
        }),
      ).resolves.toBeNull();
      await expect(
        prisma.media.findUnique({ where: { id: ticket.mediaId } }),
      ).resolves.toMatchObject({ status: 'ready', stagingKey: null });
    });

    it('a re-upload after rejection is never read, and the cleanup removes it', async () => {
      const ticket = await requestUpload('catalog.product-image', 'image/jpeg');
      const staging = {
        bucket: ticket.fields.bucket ?? '',
        key: ticket.fields.key ?? '',
      };
      expect((await post(ticket, file(EXE))).status).toBe(204);
      await confirm(ticket.mediaId).expect(422);

      expect((await post(ticket, file(JPEG))).status).toBe(204);
      const again = await confirm(ticket.mediaId).expect(422);
      expect((again.body as ErrorResponseBody).details).toEqual({
        reason: 'TYPE_NOT_ALLOWED',
      });

      await expire(ticket.mediaId);
      await runCleanup();
      await expect(storage.getObjectMetadata(staging)).resolves.toBeNull();
      await expect(
        prisma.media.findUnique({ where: { id: ticket.mediaId } }),
      ).resolves.toMatchObject({
        status: 'rejected',
        stagingKey: null,
        bucket: null,
      });
    });

    it('two confirmations racing a re-upload leave a consistent file', async () => {
      // The exact interleaving is up to the event loop and MinIO, so this asserts the
      // invariant whatever the order: a ready row serves a checked JPEG at its own
      // location, a rejected one has no copy. The fixed interleavings are unit-tested.
      const ticket = await requestUpload('catalog.product-image', 'image/jpeg');
      const good = file(JPEG, 2_048);
      expect((await post(ticket, file(EXE))).status).toBe(204);

      const [first, , second] = await Promise.all([
        confirm(ticket.mediaId),
        post(ticket, good),
        confirm(ticket.mediaId),
      ]);

      const row = await prisma.media.findUnique({
        where: { id: ticket.mediaId },
      });
      if (row?.status === 'ready') {
        const served = await fetch((await downloadLink(ticket.mediaId)).url);
        expect(new Uint8Array(await served.arrayBuffer())).toEqual(good);
      } else {
        expect(row).toMatchObject({ status: 'rejected', bucket: null });
      }
      expect([first.status, second.status].sort()).toEqual(
        row?.status === 'ready' ? expect.arrayContaining([200]) : [422, 422],
      );
    });
  });

  it('keeps the cleanup job scheduled at the configured interval', async () => {
    const queue = app.get<Queue>(getQueueToken(QUEUE_NAMES.mediaCleanup));

    // Registered in the background at startup.
    await app.get(MediaCleanupScheduler).whenRegistered();
    const schedulers = await queue.getJobSchedulers();

    expect(schedulers).toContainEqual(
      expect.objectContaining({
        key: MEDIA_CLEANUP.schedulerId,
        name: MEDIA_CLEANUP.jobName,
        every: env.MEDIA_CLEANUP_INTERVAL_SECONDS * 1_000,
      }),
    );
  });

  it('the cleanup job deletes an unconfirmed pending upload: its object and its row', async () => {
    const ticket = await requestUpload('vendor.document', 'application/pdf');
    expect((await post(ticket, file(PDF))).status).toBe(204);
    const location = {
      bucket: ticket.fields.bucket ?? '',
      key: ticket.fields.key ?? '',
    };
    await expire(ticket.mediaId);

    await runCleanup();
    // Run again: nothing left to remove, nothing fails.
    await runCleanup();

    await expect(storage.getObjectMetadata(location)).resolves.toBeNull();
    await expect(
      prisma.media.findUnique({ where: { id: ticket.mediaId } }),
    ).resolves.toBeNull();
  });
});
