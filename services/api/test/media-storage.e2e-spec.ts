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
 * (scripts/e2e.mjs): what the presigned POST policy really enforces, public and private
 * reads, and the cleanup job. Uploads are real multipart form POSTs, as a browser or the
 * app sends them.
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
      await storage.deleteObject({ bucket: row.bucket, key: row.objectKey });
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

  it('a public object is reachable at its public URL after confirm', async () => {
    const ticket = await requestUpload('catalog.product-image', 'image/jpeg');
    const bytes = file(JPEG, 4_096);
    expect((await post(ticket, bytes)).status).toBe(204);
    await confirm(ticket.mediaId).expect(200);

    const link = await downloadLink(ticket.mediaId);
    const res = await fetch(link.url);

    expect(link.expiresAt).toBeNull();
    expect(link.url).toBe(
      `${env.STORAGE_PUBLIC_BASE_URL}/${ticket.fields.key}`,
    );
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

    const direct = await fetch(
      `${endpoint}/${ticket.fields.bucket}/${ticket.fields.key}`,
    );
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
    await prisma.media.update({
      where: { id: ticket.mediaId },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    const processor = app.get(MediaCleanupProcessor);
    const job = {
      id: 'e2e-cleanup',
      name: MEDIA_CLEANUP.jobName,
      data: {},
      queueName: QUEUE_NAMES.mediaCleanup,
    } as unknown as Job<unknown, number>;

    await processor.process(job);
    // Run again: nothing left to remove, nothing fails.
    await processor.process(job);

    await expect(storage.getObjectMetadata(location)).resolves.toBeNull();
    await expect(
      prisma.media.findUnique({ where: { id: ticket.mediaId } }),
    ).resolves.toBeNull();
  });
});
