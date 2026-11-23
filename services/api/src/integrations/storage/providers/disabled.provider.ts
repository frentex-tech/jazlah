import { StorageError } from '../storage.errors';
import type { StoragePort } from '../storage.port';
import type {
  PresignedDownload,
  PresignedUpload,
  StorageObjectMetadata,
} from '../storage.types';

/**
 * No object storage (`STORAGE_PROVIDER=disabled`): staging before its S3 account
 * exists (DECISIONS.md, "Staging without object storage"). Refused when
 * DEPLOYMENT_ENV is production.
 *
 * Every upload and download fails with StorageError `disabled` (503 to the client, the
 * reason in the log). Nothing is ever stored, so a lookup finds nothing and a delete
 * succeeds: the media cleanup keeps running without errors.
 */
export class DisabledStorageProvider implements StoragePort {
  createPresignedUpload(): Promise<PresignedUpload> {
    return Promise.reject(new StorageError('disabled'));
  }

  createPresignedDownload(): Promise<PresignedDownload> {
    return Promise.reject(new StorageError('disabled'));
  }

  getObjectMetadata(): Promise<StorageObjectMetadata | null> {
    return Promise.resolve(null);
  }

  readObjectStart(): Promise<Uint8Array | null> {
    return Promise.resolve(null);
  }

  copyObject(): Promise<boolean> {
    return Promise.reject(new StorageError('disabled'));
  }

  deleteObject(): Promise<void> {
    return Promise.resolve();
  }
}
