import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { PrismaService } from '@infra/database/prisma.service';
import { STORAGE_PORT } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { createHttpApp } from './support/create-http-app';
import { MediaModule } from '@modules/media';
import { MediaProbeController } from './support/media-probe.controller';

/** What the probe endpoint returns for an upload request (dates as JSON strings). */
type Ticket = {
  mediaId: string;
  url: string;
  fields: Record<string, string>;
  expiresAt: string;
  confirmBy: string;
};

const MEGABYTE = 1024 * 1024;
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46];
/** A Windows executable ("MZ") about to be uploaded as a JPEG. */
const EXE = [0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00];
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

function file(start: number[], size = 1_024): Uint8Array {
  const bytes = new Uint8Array(size);
  bytes.set(start);
  return bytes;
}

/**
 * The upload flow through MediaService against the fake storage provider: nothing here
 * needs MinIO (run it with MinIO stopped). The probe controller stands in for the
 * endpoints that come with authentication. The storage side itself is proven against
 * MinIO in media-storage.e2e-spec.ts.
 */
describe('Media uploads with the fake storage (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const storage = new FakeStorageProvider();
  const created: string[] = [];

  beforeAll(async () => {
    app = await createHttpApp({
      controllers: [MediaProbeController],
      imports: [MediaModule],
      // No worker here (none is turned on): the cleanup queue is shared with the other
      // suites' apps, which use the real storage, so this app must not take their jobs.
      overrides: [{ provide: STORAGE_PORT, useValue: storage }],
    });
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    await prisma.media.deleteMany({ where: { id: { in: created } } });
    await app.close();
  });

  async function requestUpload(
    body: Record<string, unknown>,
    status = 201,
  ): Promise<request.Response> {
    const res = await request(app.getHttpServer())
      .post('/v1/test/media/uploads')
      .send(body)
      .expect(status);
    if (status === 201) {
      created.push((res.body as Ticket).mediaId);
    }
    return res;
  }

  function confirm(id: string): request.Test {
    return request(app.getHttpServer()).post(`/v1/test/media/${id}/confirm`);
  }

  function upload(ticket: Ticket, bytes: Uint8Array, contentType: string) {
    return storage.upload(
      {
        url: ticket.url,
        fields: ticket.fields,
        expiresAt: new Date(ticket.expiresAt),
      },
      { bytes, contentType },
    );
  }

  it('request, upload and confirm succeed, and the file can then be read', async () => {
    const ticket = (
      await requestUpload({
        purpose: 'catalog.product-image',
        contentType: 'image/jpeg',
        fileName: 'lamb.jpg',
      })
    ).body as Ticket;
    expect(ticket.fields.key).toMatch(
      new RegExp(
        `^catalog/product-image/\\d{4}/\\d{2}/\\d{2}/${ticket.mediaId}$`,
      ),
    );

    expect(upload(ticket, file(JPEG, 2_048), 'image/jpeg')).toEqual({
      accepted: true,
    });
    const res = await confirm(ticket.mediaId).expect(200);

    expect(res.body).toMatchObject({
      id: ticket.mediaId,
      purpose: 'catalog.product-image',
      visibility: 'public',
      status: 'ready',
      sizeBytes: 2_048,
      contentType: 'image/jpeg',
      originalFileName: 'lamb.jpg',
      rejectionReason: null,
    });
    const link = await request(app.getHttpServer())
      .get(`/v1/test/media/${ticket.mediaId}/download-link`)
      .expect(200);
    expect(link.body).toEqual({
      url: expect.stringMatching(
        new RegExp(`/${ticket.fields.key}$`),
      ) as unknown,
      expiresAt: null,
    });
  });

  it('an oversized upload is refused by the storage, and confirming it finds nothing', async () => {
    const ticket = (
      await requestUpload({
        purpose: 'catalog.product-image',
        contentType: 'image/jpeg',
      })
    ).body as Ticket;

    expect(upload(ticket, file(JPEG, 5 * MEGABYTE + 1), 'image/jpeg')).toEqual({
      accepted: false,
      code: 'EntityTooLarge',
    });
    const res = await confirm(ticket.mediaId).expect(422);

    const body = res.body as ErrorResponseBody;
    expect(body.code).toBe('MEDIA_UPLOAD_REJECTED');
    expect(body.details).toEqual({ reason: 'OBJECT_MISSING' });
  });

  it('a file whose real type is not allowed is rejected after confirm and its object deleted', async () => {
    const ticket = (
      await requestUpload({
        purpose: 'catalog.product-image',
        contentType: 'image/jpeg',
      })
    ).body as Ticket;
    expect(upload(ticket, file(EXE), 'image/jpeg')).toEqual({ accepted: true });
    const location = {
      bucket: ticket.fields.bucket ?? '',
      key: ticket.fields.key ?? '',
    };
    expect(storage.hasObject(location)).toBe(true);

    const res = await confirm(ticket.mediaId).expect(422);

    const body = res.body as ErrorResponseBody;
    expect(body.code).toBe('MEDIA_UPLOAD_REJECTED');
    expect(body.details).toEqual({ reason: 'TYPE_NOT_ALLOWED' });
    expect(storage.hasObject(location)).toBe(false);
    await expect(
      prisma.media.findUnique({ where: { id: ticket.mediaId } }),
    ).resolves.toMatchObject({
      status: 'rejected',
      rejectionReason: 'TYPE_NOT_ALLOWED',
    });
  });

  it('confirming twice is idempotent', async () => {
    const ticket = (
      await requestUpload({
        purpose: 'vendor.document',
        contentType: 'image/png',
      })
    ).body as Ticket;
    upload(
      ticket,
      file([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      'image/png',
    );

    const first = await confirm(ticket.mediaId).expect(200);
    const second = await confirm(ticket.mediaId).expect(200);

    expect(second.body).toEqual(first.body);
    expect(first.body).toMatchObject({
      status: 'ready',
      visibility: 'private',
    });
  });

  it('confirming an unknown upload fails with MEDIA_NOT_FOUND', async () => {
    const res = await confirm(UNKNOWN_ID).expect(404);

    expect((res.body as ErrorResponseBody).code).toBe('MEDIA_NOT_FOUND');
  });

  it('confirming an expired upload fails with MEDIA_UPLOAD_EXPIRED', async () => {
    const ticket = (
      await requestUpload({
        purpose: 'catalog.product-image',
        contentType: 'image/jpeg',
      })
    ).body as Ticket;
    upload(ticket, file(JPEG), 'image/jpeg');
    await prisma.media.update({
      where: { id: ticket.mediaId },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });

    const res = await confirm(ticket.mediaId).expect(410);

    expect((res.body as ErrorResponseBody).code).toBe('MEDIA_UPLOAD_EXPIRED');
  });

  it('refuses a declared type the purpose does not accept', async () => {
    const res = await requestUpload(
      { purpose: 'catalog.product-image', contentType: 'application/pdf' },
      415,
    );

    expect(res.body).toMatchObject({
      code: 'MEDIA_CONTENT_TYPE_NOT_ALLOWED',
      details: { allowed: ['image/jpeg', 'image/png', 'image/webp'] },
    });
  });

  it('refuses an unknown purpose as invalid input', async () => {
    const res = await requestUpload(
      { purpose: 'catalog.anything', contentType: 'image/jpeg' },
      400,
    );

    expect(res.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      details: [{ field: 'purpose', constraints: ['isIn'] }],
    });
  });

  it('refuses a download link for a file that is not ready', async () => {
    const ticket = (
      await requestUpload({
        purpose: 'vendor.document',
        contentType: 'application/pdf',
      })
    ).body as Ticket;

    const res = await request(app.getHttpServer())
      .get(`/v1/test/media/${ticket.mediaId}/download-link`)
      .expect(409);

    expect((res.body as ErrorResponseBody).code).toBe('MEDIA_NOT_READY');
  });
});
