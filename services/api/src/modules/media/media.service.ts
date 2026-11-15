import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { mediaConfig } from '@config/media.config';
import type { MediaConfig } from '@config/media-config.type';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { CONTENT_SIGNATURE_LENGTH } from '@common/files/content-signatures.constants';
import { detectContentType } from '@common/files/detect-content-type';
import { sanitizeFileName } from '@common/files/sanitize-file-name';
import { DbContext } from '@infra/database/db-context';
import type { Media } from '@infra/database/generated/prisma/client';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { StorageService, type StorageLocation } from '@integrations/storage';
import type { DownloadLink } from './download-link.type';
import { isUploadPurpose } from './is-upload-purpose';
import { MEDIA_CLEANUP } from './media-cleanup.constants';
import type { MediaFile } from './media-file.type';
import type { MediaRejectionReason } from './media-rejection-reason.type';
import type { RequestUploadInput } from './request-upload-input.type';
import type { UploadPurposePolicy } from './upload-purpose-policy.type';
import { UPLOAD_PURPOSES } from './upload-purposes.constants';
import type { UploadTicket } from './upload-ticket.type';

/**
 * Tracks uploaded files, from the upload request until they are ready or rejected
 * (table `media`). The file contents never pass through the API:
 *
 * 1. `requestUpload`: a pending row and a presigned POST that the storage limits to the
 *    purpose's size and the declared type, valid STORAGE_UPLOAD_URL_EXPIRY_SECONDS.
 * 2. The client uploads straight to the storage.
 * 3. `confirmUpload`: the object must exist, be within the size limit, and its real
 *    type, read from its first bytes, must be allowed and equal the declared type. Pass:
 *    ready. Fail: the object is deleted and the row rejected with a reason. Repeating a
 *    confirmation returns the same outcome.
 * 4. `getDownloadLink`: the stable URL of a public file, or a presigned GET of a
 *    private one, created on request.
 *
 * Uploads not confirmed within MEDIA_PENDING_UPLOAD_TTL_SECONDS are removed by
 * `removeExpiredUploads` (the media-cleanup job). Every state change is a conditional
 * update on the current status, so concurrent confirmations, retries and the cleanup
 * can never both win.
 *
 * Ownership is not checked yet: authentication does not exist (rows keep `ownerId`).
 */
@Injectable()
export class MediaService {
  constructor(
    private readonly db: DbContext,
    private readonly storage: StorageService,
    @Inject(mediaConfig.KEY) private readonly config: MediaConfig,
  ) {}

  /**
   * Creates a pending upload and its presigned POST. Throws
   * MEDIA_CONTENT_TYPE_NOT_ALLOWED when the purpose does not accept `contentType`.
   * The object key is generated here; the client's file name is stored, sanitised, as
   * metadata only.
   */
  async requestUpload(input: RequestUploadInput): Promise<UploadTicket> {
    const policy = UPLOAD_PURPOSES[input.purpose];
    if (!this.allows(policy, input.contentType)) {
      throw new AppError(ErrorCode.MEDIA_CONTENT_TYPE_NOT_ALLOWED, {
        details: { allowed: policy.contentTypes },
      });
    }
    const id = randomUUID();
    const now = new Date();
    const key = this.objectKey(input.purpose, now, id);
    const upload = await this.storage.createUpload({
      visibility: policy.visibility,
      key,
      contentType: input.contentType,
      maxSizeBytes: policy.maxSizeBytes,
    });
    const confirmBy = new Date(
      now.getTime() + this.config.pendingUploadTtlSeconds * 1_000,
    );
    await this.query(() =>
      this.db.client.media.create({
        data: {
          id,
          purpose: input.purpose,
          visibility: policy.visibility,
          bucket: upload.location.bucket,
          objectKey: key,
          originalFileName:
            input.fileName == null ? null : sanitizeFileName(input.fileName),
          ownerId: input.ownerId ?? null,
          expiresAt: confirmBy,
        },
      }),
    );
    return {
      mediaId: id,
      url: upload.url,
      fields: upload.fields,
      expiresAt: upload.expiresAt,
      confirmBy,
    };
  }

  /**
   * Checks an uploaded file and makes it ready, or rejects it (deleting the object) and
   * throws MEDIA_UPLOAD_REJECTED with `details.reason`. Idempotent: confirming a ready
   * file returns it again, a rejected one throws the same error again. Throws
   * MEDIA_NOT_FOUND for an unknown id and MEDIA_UPLOAD_EXPIRED past the confirm window.
   */
  async confirmUpload(id: string): Promise<MediaFile> {
    const row = await this.loadRow(id);
    if (row.status !== 'pending') {
      return this.settled(row);
    }
    if (row.expiresAt.getTime() <= Date.now()) {
      throw new AppError(ErrorCode.MEDIA_UPLOAD_EXPIRED);
    }
    const location = { bucket: row.bucket, key: row.objectKey };
    const verdict = await this.inspect(location, this.policyOf(row));
    if ('reason' in verdict) {
      // The object goes first: a failure here leaves the row pending, and the cleanup
      // job removes both later. The reverse could leave an object no row points to.
      await this.storage.deleteObject(location);
      await this.query(() =>
        this.db.client.media.updateMany({
          where: { id, status: 'pending' },
          data: { status: 'rejected', rejectionReason: verdict.reason },
        }),
      );
    } else {
      await this.query(() =>
        this.db.client.media.updateMany({
          where: { id, status: 'pending' },
          data: {
            status: 'ready',
            sizeBytes: verdict.sizeBytes,
            detectedContentType: verdict.contentType,
            confirmedAt: new Date(),
          },
        }),
      );
    }
    // Whoever won (this call, a concurrent confirmation or the cleanup) decided the row.
    return this.settled(await this.loadRow(id));
  }

  /**
   * Where a ready file is read: the stable public URL for a public file, a presigned
   * GET (STORAGE_DOWNLOAD_URL_EXPIRY_SECONDS) for a private one. Throws MEDIA_NOT_FOUND,
   * or MEDIA_NOT_READY for a pending or rejected file.
   */
  async getDownloadLink(id: string): Promise<DownloadLink> {
    const row = await this.loadRow(id);
    if (row.status !== 'ready') {
      throw new AppError(ErrorCode.MEDIA_NOT_READY);
    }
    if (row.visibility === 'public') {
      return { url: this.storage.publicUrl(row.objectKey), expiresAt: null };
    }
    return this.storage.createDownload({
      bucket: row.bucket,
      key: row.objectKey,
    });
  }

  /**
   * Removes every upload not confirmed in time: its object (if any) and then its row.
   * Returns how many rows it removed. Idempotent and safe beside a concurrent run: the
   * expired rows are first claimed in one conditional update (pending to rejected,
   * EXPIRED), each object delete succeeds when the object is already gone, and each row
   * is deleted only while still claimed. A run that stops halfway leaves claimed rows
   * the next run finishes. Stops between rows once `signal` is aborted.
   */
  async removeExpiredUploads(signal?: AbortSignal): Promise<number> {
    await this.query(() =>
      this.db.client.media.updateMany({
        where: { status: 'pending', expiresAt: { lt: new Date() } },
        data: { status: 'rejected', rejectionReason: 'EXPIRED' },
      }),
    );
    let removed = 0;
    for (;;) {
      const claimed = await this.query(() =>
        this.db.client.media.findMany({
          where: { status: 'rejected', rejectionReason: 'EXPIRED' },
          select: { id: true, bucket: true, objectKey: true },
          orderBy: { expiresAt: 'asc' },
          take: MEDIA_CLEANUP.batchSize,
        }),
      );
      for (const row of claimed) {
        signal?.throwIfAborted();
        await this.storage.deleteObject({
          bucket: row.bucket,
          key: row.objectKey,
        });
        const deleted = await this.query(() =>
          this.db.client.media.deleteMany({
            where: {
              id: row.id,
              status: 'rejected',
              rejectionReason: 'EXPIRED',
            },
          }),
        );
        removed += deleted.count;
      }
      if (claimed.length < MEDIA_CLEANUP.batchSize) {
        return removed;
      }
    }
  }

  /** Reads the object's size and first bytes and decides; deletes nothing. */
  private async inspect(
    location: StorageLocation,
    policy: UploadPurposePolicy,
  ): Promise<
    | Readonly<{ reason: MediaRejectionReason }>
    | Readonly<{ sizeBytes: number; contentType: string }>
  > {
    const metadata = await this.storage.getObjectMetadata(location);
    if (metadata === null) {
      return { reason: 'OBJECT_MISSING' };
    }
    if (metadata.sizeBytes === 0) {
      return { reason: 'EMPTY_FILE' };
    }
    if (metadata.sizeBytes > policy.maxSizeBytes) {
      return { reason: 'TOO_LARGE' };
    }
    const start = await this.storage.readObjectStart(
      location,
      CONTENT_SIGNATURE_LENGTH,
    );
    if (start === null) {
      return { reason: 'OBJECT_MISSING' };
    }
    const detected = detectContentType(start);
    if (detected === null || !this.allows(policy, detected)) {
      return { reason: 'TYPE_NOT_ALLOWED' };
    }
    // The storage serves the declared type with the file: it must not lie.
    if (metadata.contentType !== detected) {
      return { reason: 'CONTENT_TYPE_MISMATCH' };
    }
    return { sizeBytes: metadata.sizeBytes, contentType: detected };
  }

  /** The outcome of a row that is no longer pending: the file, or the error it ended with. */
  private settled(row: Media): MediaFile {
    if (row.status === 'ready') {
      return this.toMediaFile(row);
    }
    if (row.status === 'rejected') {
      if (row.rejectionReason === 'EXPIRED') {
        throw new AppError(ErrorCode.MEDIA_UPLOAD_EXPIRED);
      }
      throw new AppError(ErrorCode.MEDIA_UPLOAD_REJECTED, {
        details: { reason: row.rejectionReason },
      });
    }
    // Still pending after a conditional update: only a concurrent request that is
    // itself confirming can be in this state; let the client confirm again.
    throw new AppError(ErrorCode.MEDIA_NOT_READY);
  }

  private async loadRow(id: string): Promise<Media> {
    const row = await this.query(() =>
      this.db.client.media.findUnique({ where: { id } }),
    );
    if (row === null) {
      throw new AppError(ErrorCode.MEDIA_NOT_FOUND);
    }
    return row;
  }

  /** The policy of a row's purpose; a purpose removed from UPLOAD_PURPOSES is a bug. */
  private policyOf(row: Media): UploadPurposePolicy {
    if (!isUploadPurpose(row.purpose)) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        cause: new Error(`media ${row.id} has an unknown purpose`),
      });
    }
    return UPLOAD_PURPOSES[row.purpose];
  }

  private allows(policy: UploadPurposePolicy, contentType: string): boolean {
    return policy.contentTypes.some((allowed) => allowed === contentType);
  }

  /**
   * `<purpose with dots as slashes>/<yyyy>/<mm>/<dd>/<id>`, the date in UTC: generated
   * here, never from client input.
   */
  private objectKey(purpose: string, now: Date, id: string): string {
    const day = now.toISOString().slice(0, 10).replaceAll('-', '/');
    return `${purpose.replaceAll('.', '/')}/${day}/${id}`;
  }

  private toMediaFile(row: Media): MediaFile {
    return {
      id: row.id,
      purpose: row.purpose,
      visibility: row.visibility,
      status: row.status,
      sizeBytes: row.sizeBytes,
      contentType: row.detectedContentType,
      originalFileName: row.originalFileName,
      ownerId: row.ownerId,
      rejectionReason: row.rejectionReason,
      createdAt: row.createdAt,
      confirmedAt: row.confirmedAt,
    };
  }

  /** Runs a query, turning known database errors into AppError (database.md, 17). */
  private async query<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
