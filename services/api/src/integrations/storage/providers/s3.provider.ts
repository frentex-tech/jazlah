import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { OnModuleDestroy } from '@nestjs/common';
import type { StorageConfig } from '@config/storage-config.type';
import { StorageError } from '../storage.errors';
import type { StoragePort } from '../storage.port';
import type {
  PresignedDownload,
  PresignedDownloadRequest,
  PresignedUpload,
  PresignedUploadRequest,
  StorageFailureReason,
  StorageLocation,
  StorageObjectMetadata,
} from '../storage.types';

/**
 * The storage port over the S3 API, with the official AWS SDK v3 (`@aws-sdk/client-s3`,
 * `@aws-sdk/s3-presigned-post`, `@aws-sdk/s3-request-presigner`). Works with AWS S3 and
 * S3-compatible services (MinIO): STORAGE_ENDPOINT points at the service and
 * STORAGE_FORCE_PATH_STYLE puts the bucket in the path instead of the host name.
 *
 * - Uploads are presigned POST policies (not PUT URLs): the policy carries
 *   `content-length-range` and the exact Content-Type, which the storage enforces; a
 *   presigned PUT cannot limit the size. Signing is local.
 * - Every call is bounded (connection and request timeouts below); the SDK retries
 *   retryable failures itself (3 attempts, its default) before one reaches us.
 * - Every vendor error becomes a StorageError (`toStorageError`), never an SDK type.
 *
 * Vendor facts, from the SDK's own documentation (the `@throws` of each command in
 * `@aws-sdk/client-s3`) and its retry classification (`@smithy/core`, retry
 * submodule): HeadObject throws `NotFound` (its 404 has no body, so a missing bucket
 * also reads as `NotFound`); GetObject throws `NoSuchKey` and `InvalidObjectState`;
 * DeleteObject documents no error of its own and succeeds for a missing key.
 */
export class S3StorageProvider implements StoragePort, OnModuleDestroy {
  /** How long opening a connection to the storage may take. */
  static readonly CONNECTION_TIMEOUT_MS = 3_000;
  /** How long one request and its response may take. */
  static readonly REQUEST_TIMEOUT_MS = 10_000;
  /** Throttling codes, from the SDK's retry classification (THROTTLING_ERROR_CODES). */
  private static readonly THROTTLING_ERRORS: readonly string[] = [
    'SlowDown',
    'Throttling',
    'ThrottlingException',
    'RequestThrottled',
    'RequestThrottledException',
    'TooManyRequestsException',
    'RequestLimitExceeded',
    'BandwidthLimitExceeded',
  ];
  /** Transient codes, from the SDK's retry classification (TRANSIENT_ERROR_CODES). */
  private static readonly TRANSIENT_ERRORS: readonly string[] = [
    'TimeoutError',
    'RequestTimeout',
    'RequestTimeoutException',
  ];
  /** Node.js network and timeout codes the SDK treats as transient. */
  private static readonly NETWORK_ERRORS: readonly string[] = [
    'ECONNRESET',
    'ECONNREFUSED',
    'EPIPE',
    'ETIMEDOUT',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'ENOTFOUND',
    'EAI_AGAIN',
  ];
  /** Credentials or permissions refused (403 AccessDenied and its causes). */
  private static readonly ACCESS_ERRORS: readonly string[] = [
    'AccessDenied',
    'InvalidAccessKeyId',
    'SignatureDoesNotMatch',
  ];

  private readonly client: S3Client;

  /** `client` replaces the SDK client in unit tests only. */
  constructor(config: StorageConfig, client?: S3Client) {
    this.client =
      client ??
      new S3Client({
        region: config.region,
        endpoint: config.endpoint,
        forcePathStyle: config.forcePathStyle,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        requestHandler: {
          connectionTimeout: S3StorageProvider.CONNECTION_TIMEOUT_MS,
          requestTimeout: S3StorageProvider.REQUEST_TIMEOUT_MS,
          throwOnRequestTimeout: true,
        },
      });
  }

  async createPresignedUpload(
    request: PresignedUploadRequest,
  ): Promise<PresignedUpload> {
    const expiresAt = new Date(Date.now() + request.expiresInSeconds * 1_000);
    try {
      // Each field becomes an exact-match condition of the policy (the SDK adds them,
      // with `bucket` and `key`), so the Content-Type is pinned by the field alone.
      const { url, fields } = await createPresignedPost(this.client, {
        Bucket: request.location.bucket,
        Key: request.location.key,
        Conditions: [
          ['content-length-range', request.minSizeBytes, request.maxSizeBytes],
        ],
        Fields: { 'Content-Type': request.contentType },
        Expires: request.expiresInSeconds,
      });
      return { url, fields, expiresAt };
    } catch (error) {
      throw this.toStorageError(error);
    }
  }

  async createPresignedDownload(
    request: PresignedDownloadRequest,
  ): Promise<PresignedDownload> {
    const expiresAt = new Date(Date.now() + request.expiresInSeconds * 1_000);
    try {
      const url = await getSignedUrl(
        this.client,
        new GetObjectCommand({
          Bucket: request.location.bucket,
          Key: request.location.key,
        }),
        { expiresIn: request.expiresInSeconds },
      );
      return { url, expiresAt };
    } catch (error) {
      throw this.toStorageError(error);
    }
  }

  async getObjectMetadata(
    location: StorageLocation,
  ): Promise<StorageObjectMetadata | null> {
    try {
      const output = await this.client.send(
        new HeadObjectCommand({ Bucket: location.bucket, Key: location.key }),
      );
      return {
        sizeBytes: output.ContentLength ?? 0,
        contentType: output.ContentType ?? null,
      };
    } catch (error) {
      if (this.errorName(error) === 'NotFound') {
        return null;
      }
      throw this.toStorageError(error);
    }
  }

  async readObjectStart(
    location: StorageLocation,
    byteCount: number,
  ): Promise<Uint8Array | null> {
    try {
      const output = await this.client.send(
        new GetObjectCommand({
          Bucket: location.bucket,
          Key: location.key,
          Range: `bytes=0-${byteCount - 1}`,
        }),
      );
      const bytes =
        (await output.Body?.transformToByteArray()) ?? new Uint8Array();
      // A service that ignores Range sends the whole object: keep the start only.
      return bytes.subarray(0, byteCount);
    } catch (error) {
      const name = this.errorName(error);
      if (name === 'NoSuchKey') {
        return null;
      }
      if (name === 'InvalidRange') {
        // A range starting at 0 is unsatisfiable only for an empty object.
        return new Uint8Array();
      }
      throw this.toStorageError(error);
    }
  }

  async deleteObject(location: StorageLocation): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: location.bucket, Key: location.key }),
      );
    } catch (error) {
      throw this.toStorageError(error);
    }
  }

  /** Closes the SDK's connection pool at shutdown. */
  onModuleDestroy(): void {
    this.client.destroy();
  }

  /** Maps any failure of an SDK call to a StorageError, keeping it as the cause. */
  private toStorageError(error: unknown): StorageError {
    return new StorageError(this.failureReason(error), { cause: error });
  }

  private failureReason(error: unknown): StorageFailureReason {
    const name = this.errorName(error);
    const status = this.httpStatus(error);
    if (name === 'NoSuchBucket') {
      return 'bucket-missing';
    }
    if (name === 'InvalidObjectState') {
      return 'object-archived';
    }
    if (status === 429 || S3StorageProvider.THROTTLING_ERRORS.includes(name)) {
      return 'throttled';
    }
    if (status === 403 || S3StorageProvider.ACCESS_ERRORS.includes(name)) {
      return 'access-denied';
    }
    if (
      S3StorageProvider.TRANSIENT_ERRORS.includes(name) ||
      (status !== undefined && status >= 500) ||
      S3StorageProvider.NETWORK_ERRORS.includes(this.systemCode(error))
    ) {
      return 'unavailable';
    }
    if (status !== undefined && status >= 400) {
      // A documented or undocumented 4xx: the same request will be refused again.
      return 'rejected';
    }
    // No response at all and no known cause (an unknown network failure): retryable,
    // as an undocumented vendor error is (.claude/rules/integrations.md).
    return 'unavailable';
  }

  private errorName(error: unknown): string {
    return error instanceof Error ? error.name : '';
  }

  private httpStatus(error: unknown): number | undefined {
    return error instanceof S3ServiceException
      ? error.$metadata.httpStatusCode
      : undefined;
  }

  /** A Node.js system error code (`ECONNREFUSED`), also from an AggregateError's first error. */
  private systemCode(error: unknown): string {
    if (!(error instanceof Error)) {
      return '';
    }
    const code: unknown = Reflect.get(error, 'code');
    if (typeof code === 'string') {
      return code;
    }
    return error instanceof AggregateError
      ? this.systemCode(error.errors[0])
      : '';
  }
}
