import type { StoragePort } from '../storage.port';
import type {
  PresignedDownload,
  PresignedDownloadRequest,
  PresignedUpload,
  PresignedUploadRequest,
  StorageLocation,
  StorageObjectMetadata,
} from '../storage.types';

/**
 * The storage port in memory, for tests: no network, deterministic (pass `now` to fix
 * the clock), every call recorded in `calls`, and any operation can be told to fail
 * once with `failNext`.
 *
 * It behaves as the storage does where the API relies on it: `upload` plays the
 * client's form POST and enforces the presigned policy (expiry, size range, exact
 * Content-Type, the signed bucket and key), so a test can prove an oversized or
 * mistyped upload is refused without a storage server. Objects keep the Content-Type the upload
 * declared, as real storage does.
 *
 * Exported from the integration's `index.ts` for tests; production code injects the
 * StorageService, never this class.
 */
export class FakeStorageProvider implements StoragePort {
  /** Every port call, in order: the operation and the object it concerned. */
  readonly calls: {
    operation: keyof StoragePort;
    location: StorageLocation;
  }[] = [];
  private readonly objects = new Map<
    string,
    { bytes: Uint8Array; contentType: string | null }
  >();
  private readonly policies = new Map<
    string,
    PresignedUploadRequest & { expiresAt: number }
  >();
  private readonly failures = new Map<keyof StoragePort, Error>();
  private nextPolicy = 1;

  constructor(private readonly now: () => number = Date.now) {}

  /** The next call of `operation` rejects with `error` (once). */
  failNext(operation: keyof StoragePort, error: Error): void {
    this.failures.set(operation, error);
  }

  /** Stores an object directly, as if it had been uploaded. */
  putObject(
    location: StorageLocation,
    bytes: Uint8Array,
    contentType: string | null,
  ): void {
    this.objects.set(this.id(location), { bytes, contentType });
  }

  hasObject(location: StorageLocation): boolean {
    return this.objects.has(this.id(location));
  }

  /**
   * The client's POST of `bytes` with the form `upload.fields`, declaring
   * `contentType`. Refused, as the storage refuses it, with the storage's error code:
   * `AccessDenied` (unknown or expired policy, or a field changed), `EntityTooSmall`,
   * `EntityTooLarge`, or `AccessDenied` for a Content-Type other than the signed one.
   */
  upload(
    upload: PresignedUpload,
    file: Readonly<{ bytes: Uint8Array; contentType: string }>,
  ): Readonly<{ accepted: true } | { accepted: false; code: string }> {
    const policy = this.policies.get(upload.fields.Policy ?? '');
    if (
      policy === undefined ||
      this.now() > policy.expiresAt ||
      upload.fields.bucket !== policy.location.bucket ||
      upload.fields.key !== policy.location.key
    ) {
      return { accepted: false, code: 'AccessDenied' };
    }
    if (file.contentType !== policy.contentType) {
      return { accepted: false, code: 'AccessDenied' };
    }
    if (file.bytes.length < policy.minSizeBytes) {
      return { accepted: false, code: 'EntityTooSmall' };
    }
    if (file.bytes.length > policy.maxSizeBytes) {
      return { accepted: false, code: 'EntityTooLarge' };
    }
    this.putObject(policy.location, file.bytes, file.contentType);
    return { accepted: true };
  }

  createPresignedUpload(
    request: PresignedUploadRequest,
  ): Promise<PresignedUpload> {
    return this.call('createPresignedUpload', request.location, () => {
      const expiresAt = this.now() + request.expiresInSeconds * 1_000;
      const policy = `fake-policy-${this.nextPolicy++}`;
      this.policies.set(policy, { ...request, expiresAt });
      return {
        url: `https://fake-storage.invalid/${request.location.bucket}`,
        fields: {
          bucket: request.location.bucket,
          key: request.location.key,
          'Content-Type': request.contentType,
          Policy: policy,
        },
        expiresAt: new Date(expiresAt),
      };
    });
  }

  createPresignedDownload(
    request: PresignedDownloadRequest,
  ): Promise<PresignedDownload> {
    return this.call('createPresignedDownload', request.location, () => {
      const expiresAt = this.now() + request.expiresInSeconds * 1_000;
      return {
        url: `https://fake-storage.invalid/${request.location.bucket}/${request.location.key}?expires=${expiresAt}`,
        expiresAt: new Date(expiresAt),
      };
    });
  }

  getObjectMetadata(
    location: StorageLocation,
  ): Promise<StorageObjectMetadata | null> {
    return this.call('getObjectMetadata', location, () => {
      const object = this.objects.get(this.id(location));
      return object === undefined
        ? null
        : { sizeBytes: object.bytes.length, contentType: object.contentType };
    });
  }

  readObjectStart(
    location: StorageLocation,
    byteCount: number,
  ): Promise<Uint8Array | null> {
    return this.call('readObjectStart', location, () => {
      const object = this.objects.get(this.id(location));
      return object === undefined ? null : object.bytes.slice(0, byteCount);
    });
  }

  deleteObject(location: StorageLocation): Promise<void> {
    return this.call('deleteObject', location, () => {
      this.objects.delete(this.id(location));
    });
  }

  private async call<T>(
    operation: keyof StoragePort,
    location: StorageLocation,
    work: () => T,
  ): Promise<T> {
    this.calls.push({ operation, location });
    const failure = this.failures.get(operation);
    if (failure !== undefined) {
      this.failures.delete(operation);
      throw failure;
    }
    // Asynchronous like real storage, so callers cannot depend on synchronous effects.
    await Promise.resolve();
    return work();
  }

  private id(location: StorageLocation): string {
    return `${location.bucket}/${location.key}`;
  }
}
