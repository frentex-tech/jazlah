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
import { RateLimiter } from '@infra/rate-limit/rate-limiter';
import { StorageService, type StorageLocation } from '@integrations/storage';
import type { DownloadLink } from './download-link.type';
import { isUploadPurpose } from './is-upload-purpose';
import { MEDIA_CLEANUP_SCOPE } from './media-cleanup-scope.constants';
import type { MediaCleanupScope } from './media-cleanup-scope.type';
import { MEDIA_CLEANUP } from './media-cleanup.constants';
import { MEDIA_RATE_LIMITS } from './media-rate-limits.constants';
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
 * 1. `requestUpload`: a pending row and a presigned POST for a **staging key in the
 *    private bucket**, whatever the purpose's visibility, limited by the storage to the
 *    purpose's size and the declared type, valid STORAGE_UPLOAD_URL_EXPIRY_SECONDS.
 * 2. The client uploads straight to the storage.
 * 3. `confirmUpload`: the staging object is **copied** to a final key in the purpose's
 *    bucket that no ticket names, unique to this confirmation attempt; the copy must be
 *    within the size limit and its real type, read from its first bytes, must be allowed
 *    and equal the declared type. Pass: the row becomes ready with the copy's location,
 *    then the staging object is deleted. Fail: both objects are deleted and the row
 *    rejected with a reason. Repeating a confirmation returns the same outcome.
 * 4. `getDownloadLink`: the stable URL of a public file, or a presigned GET of a
 *    private one, created on request.
 *
 * Why the copy: a presigned POST can be used again until it expires. The client can
 * write the staging key after confirmation, but never the checked copy, and nothing
 * unchecked is ever publicly readable. Each attempt copies to its own key, so two
 * confirmations racing a re-upload cannot overwrite each other's checked copy: the one
 * whose conditional update wins keeps its copy, the other deletes its own.
 *
 * Uploads not confirmed within MEDIA_PENDING_UPLOAD_TTL_SECONDS are removed by
 * `removeExpiredUploads` (the media-cleanup job), which also deletes the staging object
 * of every confirmed or rejected upload once its ticket has expired (a client may
 * re-upload until then). Every state change is a conditional update on the current
 * status, so concurrent confirmations, retries and the cleanup can never both win.
 *
 * `requestUpload`, `confirmUpload` and `removeExpiredUploads` call the storage: never
 * call them inside `TransactionRunner.run` (database.md, Transactions).
 *
 * Ownership is not checked yet: no endpoint exists (rows keep `ownerId`).
 */
@Injectable()
export class MediaService {
  /** Prefix of every staging key, in the private bucket. */
  static readonly STAGING_PREFIX = 'staging';

  constructor(
    private readonly db: DbContext,
    private readonly storage: StorageService,
    @Inject(mediaConfig.KEY) private readonly config: MediaConfig,
    @Inject(MEDIA_CLEANUP_SCOPE)
    private readonly cleanupScope: MediaCleanupScope | null,
    private readonly rateLimiter: RateLimiter,
  ) {}

  /**
   * Creates a pending upload and its presigned POST. Throws
   * MEDIA_CONTENT_TYPE_NOT_ALLOWED when the purpose does not accept `contentType`, and
   * RATE_LIMITED (or SERVICE_UNAVAILABLE while the limit cannot be counted) when the
   * owner has requested too many uploads (`MEDIA_RATE_LIMITS.owner`), before anything
   * is created.
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
    if (input.ownerId != null) {
      await this.rateLimiter.consume(MEDIA_RATE_LIMITS.owner, input.ownerId);
    }
    const id = randomUUID();
    const now = new Date();
    const stagingKey = `${MediaService.STAGING_PREFIX}/${this.baseKey(input.purpose, now, id)}`;
    const upload = await this.storage.createUpload({
      visibility: 'private',
      key: stagingKey,
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
          stagingKey,
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
   * Checks an uploaded file and makes it ready, or rejects it (deleting its objects) and
   * throws MEDIA_UPLOAD_REJECTED with `details.reason`. Idempotent: confirming a ready
   * file returns it again, a rejected one throws the same error again. Throws
   * MEDIA_NOT_FOUND for an unknown id and MEDIA_UPLOAD_EXPIRED past the confirm window.
   */
  async confirmUpload(id: string): Promise<MediaFile> {
    const row = await this.loadRow(id);
    if (row.status !== 'pending') {
      return this.settled(row);
    }
    if (row.expiresAt.getTime() <= Date.now() || row.stagingKey === null) {
      // A pending row without a staging key predates staged uploads: it can only expire.
      throw new AppError(ErrorCode.MEDIA_UPLOAD_EXPIRED);
    }
    const policy = this.policyOf(row);
    const staging = this.stagingLocation(row.stagingKey);
    const copy: StorageLocation = {
      bucket: this.storage.bucketFor(policy.visibility),
      key: `${this.baseKey(row.purpose, row.createdAt, row.id)}/${randomUUID()}`,
    };
    const copied = await this.storage.copyObject(staging, copy);
    const verdict = copied
      ? await this.inspect(copy, policy)
      : ({ reason: 'OBJECT_MISSING' } as const);
    if ('reason' in verdict) {
      // The objects go first: a failure here leaves the row pending, and the cleanup
      // removes the staging object later. The reverse could leave an object no row
      // points to.
      await this.storage.deleteObject(copy);
      await this.storage.deleteObject(staging);
      await this.query(() =>
        this.db.client.media.updateMany({
          where: { id, status: 'pending' },
          data: { status: 'rejected', rejectionReason: verdict.reason },
        }),
      );
    } else {
      const won = await this.query(() =>
        this.db.client.media.updateMany({
          where: { id, status: 'pending' },
          data: {
            status: 'ready',
            bucket: copy.bucket,
            objectKey: copy.key,
            sizeBytes: verdict.sizeBytes,
            detectedContentType: verdict.contentType,
            confirmedAt: new Date(),
          },
        }),
      );
      // Another confirmation or the cleanup decided the row first: this copy is unused.
      // Ours alone (its key is unique to this attempt), so deleting it is always safe.
      await this.storage.deleteObject(won.count === 1 ? staging : copy);
    }
    // Whoever won (this call, a concurrent confirmation or the cleanup) decided the row.
    return this.settled(await this.loadRow(id));
  }

  /**
   * confirmUpload for an upload endpoint: the file must belong to `ownerId` (the user
   * who requested the upload). Another user's file is answered exactly like a missing
   * one, MEDIA_NOT_FOUND, so its existence is not revealed.
   */
  async confirmOwnUpload(id: string, ownerId: string): Promise<MediaFile> {
    const row = await this.loadRow(id);
    if (row.ownerId !== ownerId) {
      throw new AppError(ErrorCode.MEDIA_NOT_FOUND);
    }
    return this.confirmUpload(id);
  }

  /**
   * The files with these ids, in any status; ids with no file are left out. For a module
   * checking files it is given (their owner, purpose and status) before it refers to
   * them.
   */
  async findFiles(ids: readonly string[]): Promise<MediaFile[]> {
    if (ids.length === 0) {
      return [];
    }
    const rows = await this.query(() =>
      this.db.client.media.findMany({ where: { id: { in: [...ids] } } }),
    );
    return rows.map((row) => this.toMediaFile(row));
  }

  /**
   * The stable public URL of each ready public file among `ids`, by id, without calling
   * the storage (one database read; the URL is built from configuration). For lists
   * that show images (vendor logos). Private, unconfirmed and unknown ids are left out.
   */
  async getPublicUrls(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, string>> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) {
      return new Map();
    }
    const rows = await this.query(() =>
      this.db.client.media.findMany({
        where: { id: { in: unique }, status: 'ready', visibility: 'public' },
      }),
    );
    return new Map(
      rows.map((row) => [
        row.id,
        this.storage.publicUrl(this.readyLocation(row).key),
      ]),
    );
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
    const location = this.readyLocation(row);
    if (row.visibility === 'public') {
      return { url: this.storage.publicUrl(location.key), expiresAt: null };
    }
    return this.storage.createDownload(location);
  }

  /**
   * The cleanup, in two passes. Returns how many rows it removed.
   *
   * 1. Every upload not confirmed in time: its objects and then its row. The expired
   *    rows are first claimed in one conditional update (pending to rejected, EXPIRED);
   *    each row is deleted only while still claimed.
   * 2. The staging object of every confirmed or rejected upload whose confirm window,
   *    and so its ticket, has ended: deleted, then the row's staging key cleared while
   *    it is unchanged. Until then the client may re-upload to it; it is never read.
   *
   * Idempotent and safe beside a concurrent run: each object delete succeeds when the
   * object is already gone. A run that stops halfway leaves work the next run finishes.
   * Stops between rows once `signal` is aborted.
   *
   * Both passes act only on the uploads of MEDIA_CLEANUP_SCOPE: all of them in
   * production; one owner's in an e2e app, so suites sharing a database stay apart.
   */
  async removeExpiredUploads(signal?: AbortSignal): Promise<number> {
    await this.query(() =>
      this.db.client.media.updateMany({
        where: {
          ...this.inCleanupScope(),
          status: 'pending',
          expiresAt: { lt: new Date() },
        },
        data: { status: 'rejected', rejectionReason: 'EXPIRED' },
      }),
    );
    const removed = await this.removeClaimedRows(signal);
    await this.removeSettledStagingObjects(signal);
    return removed;
  }

  private async removeClaimedRows(signal?: AbortSignal): Promise<number> {
    let removed = 0;
    for (;;) {
      const claimed = await this.query(() =>
        this.db.client.media.findMany({
          where: {
            ...this.inCleanupScope(),
            status: 'rejected',
            rejectionReason: 'EXPIRED',
          },
          select: { id: true, bucket: true, objectKey: true, stagingKey: true },
          orderBy: { expiresAt: 'asc' },
          take: MEDIA_CLEANUP.batchSize,
        }),
      );
      for (const row of claimed) {
        signal?.throwIfAborted();
        if (row.stagingKey !== null) {
          await this.storage.deleteObject(this.stagingLocation(row.stagingKey));
        }
        // Set only on rows from before staged uploads, which pointed at the upload itself.
        if (row.bucket !== null && row.objectKey !== null) {
          await this.storage.deleteObject({
            bucket: row.bucket,
            key: row.objectKey,
          });
        }
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

  private async removeSettledStagingObjects(
    signal?: AbortSignal,
  ): Promise<void> {
    for (;;) {
      const settled = await this.query(() =>
        this.db.client.media.findMany({
          where: {
            ...this.inCleanupScope(),
            status: { in: ['ready', 'rejected'] },
            stagingKey: { not: null },
            expiresAt: { lt: new Date() },
          },
          select: { id: true, stagingKey: true },
          orderBy: { expiresAt: 'asc' },
          take: MEDIA_CLEANUP.batchSize,
        }),
      );
      for (const row of settled) {
        signal?.throwIfAborted();
        if (row.stagingKey === null) {
          continue;
        }
        await this.storage.deleteObject(this.stagingLocation(row.stagingKey));
        await this.query(() =>
          this.db.client.media.updateMany({
            where: { id: row.id, stagingKey: row.stagingKey },
            data: { stagingKey: null },
          }),
        );
      }
      if (settled.length < MEDIA_CLEANUP.batchSize) {
        return;
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

  /** The filter that keeps the cleanup to its scope: nothing in production. */
  private inCleanupScope(): { ownerId?: string } {
    return this.cleanupScope === null
      ? {}
      : { ownerId: this.cleanupScope.ownerId };
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
    // Unreachable: settled() runs only on a row that was not pending when read, or after
    // this request's conditional update, which this request or another one won; nothing
    // ever moves a row back to pending. Reaching it is a programming error.
    throw new AppError(ErrorCode.INTERNAL_ERROR, {
      cause: new Error(`media ${row.id} still pending after confirmation`),
    });
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

  /** Where a ready row's checked copy is; the check constraint guarantees both parts. */
  private readyLocation(row: Media): StorageLocation {
    if (row.bucket === null || row.objectKey === null) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        cause: new Error(`media ${row.id} is ready without a location`),
      });
    }
    return { bucket: row.bucket, key: row.objectKey };
  }

  private stagingLocation(key: string): StorageLocation {
    return { bucket: this.storage.bucketFor('private'), key };
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
   * here, never from client input. The staging key prefixes it, the final key extends it.
   */
  private baseKey(purpose: string, created: Date, id: string): string {
    const day = created.toISOString().slice(0, 10).replaceAll('-', '/');
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
