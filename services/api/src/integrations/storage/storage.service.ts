import { Inject, Injectable } from '@nestjs/common';
import { storageConfig } from '@config/storage.config';
import type { StorageConfig } from '@config/storage-config.type';
import { STORAGE_PORT, type StoragePort } from './storage.port';
import type {
  CreatedUpload,
  CreateUploadRequest,
  PresignedDownload,
  StorageLocation,
  StorageObjectMetadata,
  StorageVisibility,
} from './storage.types';

/**
 * What the rest of the API calls for object storage. Storage has one active provider
 * and no fallback (`.claude/rules/integrations.md`): this service adds what is ours,
 * not the vendor's, around the port:
 *
 * - the bucket of each visibility (public and private objects never share a bucket);
 * - the expiry of presigned uploads and downloads, from config;
 * - the stable URL of a public object (`STORAGE_PUBLIC_BASE_URL/<key>`).
 *
 * Every failure is a StorageError (retryable or not). The API never streams file
 * contents: clients upload and download directly with the presigned URLs.
 */
@Injectable()
export class StorageService {
  /** The smallest object an upload may create: an empty file is never accepted. */
  static readonly MIN_UPLOAD_SIZE_BYTES = 1;

  constructor(
    @Inject(STORAGE_PORT) private readonly provider: StoragePort,
    @Inject(storageConfig.KEY) private readonly config: StorageConfig,
  ) {}

  /** The bucket objects of this visibility are stored in. */
  bucketFor(visibility: StorageVisibility): string {
    return visibility === 'public'
      ? this.config.publicBucket
      : this.config.privateBucket;
  }

  /**
   * A presigned form upload of one object, limited by the storage to 1 byte up to
   * `maxSizeBytes` and to exactly `contentType`, valid for
   * STORAGE_UPLOAD_URL_EXPIRY_SECONDS. The caller chooses the key; never derive it
   * from client input.
   */
  async createUpload(request: CreateUploadRequest): Promise<CreatedUpload> {
    const location = {
      bucket: this.bucketFor(request.visibility),
      key: request.key,
    };
    const upload = await this.provider.createPresignedUpload({
      location,
      contentType: request.contentType,
      minSizeBytes: StorageService.MIN_UPLOAD_SIZE_BYTES,
      maxSizeBytes: request.maxSizeBytes,
      expiresInSeconds: this.config.uploadUrlExpirySeconds,
    });
    return { ...upload, location };
  }

  /** A presigned GET of one object, valid for STORAGE_DOWNLOAD_URL_EXPIRY_SECONDS. */
  createDownload(location: StorageLocation): Promise<PresignedDownload> {
    return this.provider.createPresignedDownload({
      location,
      expiresInSeconds: this.config.downloadUrlExpirySeconds,
    });
  }

  /**
   * The stable URL of an object in the public bucket. Only meaningful for public
   * objects: a private object is read through `createDownload`.
   */
  publicUrl(key: string): string {
    const path = key.split('/').map(encodeURIComponent).join('/');
    return `${this.config.publicBaseUrl}/${path}`;
  }

  getObjectMetadata(
    location: StorageLocation,
  ): Promise<StorageObjectMetadata | null> {
    return this.provider.getObjectMetadata(location);
  }

  readObjectStart(
    location: StorageLocation,
    byteCount: number,
  ): Promise<Uint8Array | null> {
    return this.provider.readObjectStart(location, byteCount);
  }

  /** Deletes the object; succeeds when it does not exist. */
  deleteObject(location: StorageLocation): Promise<void> {
    return this.provider.deleteObject(location);
  }
}
