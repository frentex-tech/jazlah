import type {
  PresignedDownload,
  PresignedDownloadRequest,
  PresignedUpload,
  PresignedUploadRequest,
  StorageLocation,
  StorageObjectMetadata,
} from './storage.types';

/** The injection token of the active StoragePort provider. */
export const STORAGE_PORT = Symbol('STORAGE_PORT');

/**
 * What the API needs from object storage, and nothing more. Each provider implements
 * all of it; a failure is a StorageError (`storage.errors.ts`). Inject the
 * StorageService rather than the port, unless you are a provider's test.
 */
export interface StoragePort {
  /**
   * A presigned form upload that the storage itself limits to the request's size range
   * and exact Content-Type, at that location, until it expires. Signed locally: the
   * storage is not called.
   */
  createPresignedUpload(
    request: PresignedUploadRequest,
  ): Promise<PresignedUpload>;

  /** A presigned GET of one object, signed locally: the object's existence is not checked. */
  createPresignedDownload(
    request: PresignedDownloadRequest,
  ): Promise<PresignedDownload>;

  /** The object's size and stored Content-Type, or null when there is no such object. */
  getObjectMetadata(
    location: StorageLocation,
  ): Promise<StorageObjectMetadata | null>;

  /**
   * The object's first `byteCount` bytes (fewer when it is shorter, none when it is
   * empty), or null when there is no such object.
   */
  readObjectStart(
    location: StorageLocation,
    byteCount: number,
  ): Promise<Uint8Array | null>;

  /** Deletes the object. Deleting an object that does not exist succeeds. */
  deleteObject(location: StorageLocation): Promise<void>;
}
