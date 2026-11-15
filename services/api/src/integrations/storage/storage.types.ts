// The arguments and results of the storage port and service, in our terms: no vendor
// or SDK type appears here.

/** Who may read an object: anyone (public bucket) or only through a presigned URL. */
export type StorageVisibility = 'public' | 'private';

/** Where an object lives. */
export type StorageLocation = Readonly<{ bucket: string; key: string }>;

/** What a presigned upload allows; the storage enforces each limit itself. */
export type PresignedUploadRequest = Readonly<{
  location: StorageLocation;
  /** The exact Content-Type the upload must declare. */
  contentType: string;
  /** The smallest and largest accepted size, in bytes. */
  minSizeBytes: number;
  maxSizeBytes: number;
  expiresInSeconds: number;
}>;

/**
 * An HTML form upload: POST `url` as multipart/form-data with every entry of `fields`,
 * then the file in a part named `file`, last.
 */
export type PresignedUpload = Readonly<{
  url: string;
  fields: Readonly<Record<string, string>>;
  expiresAt: Date;
}>;

export type PresignedDownloadRequest = Readonly<{
  location: StorageLocation;
  expiresInSeconds: number;
}>;

/** A URL that reads one object with a GET until `expiresAt`. */
export type PresignedDownload = Readonly<{ url: string; expiresAt: Date }>;

/** What the storage reports about a stored object. */
export type StorageObjectMetadata = Readonly<{
  sizeBytes: number;
  /** The Content-Type stored with the object, as the uploader declared it; null if none. */
  contentType: string | null;
}>;

/** What the service asks for when a module needs an upload. */
export type CreateUploadRequest = Readonly<{
  visibility: StorageVisibility;
  key: string;
  contentType: string;
  maxSizeBytes: number;
}>;

/** A presigned upload, with the location it writes to. */
export type CreatedUpload = PresignedUpload &
  Readonly<{ location: StorageLocation }>;

/**
 * Why a storage call failed, for logs and the retry decision; clients see only the
 * error code.
 * - `unavailable`: unreachable, timed out, or a 5xx: retryable.
 * - `throttled`: the storage asked us to slow down: retryable.
 * - `access-denied`: credentials or permissions are wrong: not retryable.
 * - `bucket-missing`: the configured bucket does not exist: not retryable.
 * - `object-archived`: the object must be restored before it can be read: not retryable.
 * - `rejected`: the storage refused the request for another documented reason: not retryable.
 */
export type StorageFailureReason =
  | 'unavailable'
  | 'throttled'
  | 'access-denied'
  | 'bucket-missing'
  | 'object-archived'
  | 'rejected';
