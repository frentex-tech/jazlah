/**
 * Limits the media cleanup to the uploads of one owner (`media.owner_id`). Provided only
 * by e2e apps, which share one database: each app cleans only its own rows, so one
 * suite's cleanup never removes another suite's expired upload. Production provides
 * null (MEDIA_CLEANUP_SCOPE): every upload.
 */
export interface MediaCleanupScope {
  readonly ownerId: string;
}
