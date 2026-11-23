import { detectContentType } from '@common/files/detect-content-type';
import { StorageError, type CreatedUpload } from '@integrations/storage';
import { UPLOAD_PURPOSES } from '@modules/media';
import type { SeedContext } from './seed-context.type';
import type { SeedFile } from './seed-file.type';
import { SEED_EPOCH } from './seed-epoch.constants';
import { seedObjectKey } from './seed-object-key';
import { seedTime } from './seed-time';

/**
 * Makes `file` a ready upload, as if its owner had uploaded and confirmed it: the object
 * at its key (seedObjectKey) in its purpose's bucket, and a `ready` media row pointing
 * at it, so the API serves its URL exactly as for a real upload (a public file's stable
 * URL, a private one's presigned GET).
 *
 * The object is uploaded through the storage integration with a presigned POST, as a
 * client uploads, straight to its final key: the seed is the system, so the staging
 * copy and check of MediaService.confirmUpload are skipped, but the same checks are made
 * here first (the type read from the bytes, the purpose's types and size). The upload is
 * skipped when an object of the same size and type is already there, and the row is
 * created only when its id is free: running it again changes nothing. Call it outside
 * any transaction (it calls the storage).
 */
export async function ensureSeedFile(
  context: SeedContext,
  file: SeedFile,
): Promise<void> {
  const policy = UPLOAD_PURPOSES[file.purpose];
  const detected = detectContentType(file.bytes);
  if (
    detected !== file.contentType ||
    !policy.contentTypes.some((allowed) => allowed === detected) ||
    file.bytes.length > policy.maxSizeBytes
  ) {
    throw new Error(
      `Seed file ${file.fileName} is not a valid ${file.purpose} upload`,
    );
  }
  const key = seedObjectKey(file.purpose, file.id);
  const location = {
    bucket: context.storage.bucketFor(policy.visibility),
    key,
  };
  const stored = await context.storage.getObjectMetadata(location);
  if (
    stored === null ||
    stored.sizeBytes !== file.bytes.length ||
    stored.contentType !== file.contentType
  ) {
    const upload = await context.storage
      .createUpload({
        visibility: policy.visibility,
        key,
        contentType: file.contentType,
        maxSizeBytes: policy.maxSizeBytes,
      })
      .catch((error: unknown) => {
        // Staging without storage: the row is still made, and a later run uploads the file.
        if (error instanceof StorageError && error.reason === 'disabled') {
          return null;
        }
        throw error;
      });
    if (upload === null) {
      context.tally.one('objects skipped (storage disabled)', true);
    } else {
      await postUpload(upload, file);
      context.tally.one('objects uploaded', true);
    }
  } else {
    context.tally.one('objects uploaded', false);
  }
  const { count } = await context.db.client.media.createMany({
    data: [
      {
        id: file.id,
        purpose: file.purpose,
        visibility: policy.visibility,
        bucket: location.bucket,
        objectKey: key,
        stagingKey: null,
        status: 'ready',
        sizeBytes: file.bytes.length,
        detectedContentType: detected,
        originalFileName: file.fileName,
        ownerId: file.ownerId,
        expiresAt: seedTime(1),
        confirmedAt: SEED_EPOCH,
        createdAt: SEED_EPOCH,
      },
    ],
    skipDuplicates: true,
  });
  context.tally.one('media', count === 1);
  // A row made while storage was disabled names the placeholder bucket: point it at the real one.
  await context.db.client.media.updateMany({
    where: { id: file.id, bucket: { not: location.bucket } },
    data: { bucket: location.bucket },
  });
}

/** Sends the presigned form upload: every field, then the file, last (StorageService). */
async function postUpload(
  upload: CreatedUpload,
  file: SeedFile,
): Promise<void> {
  const form = new FormData();
  for (const [name, value] of Object.entries(upload.fields)) {
    form.append(name, value);
  }
  form.append(
    'file',
    new Blob([new Uint8Array(file.bytes)], { type: file.contentType }),
    file.fileName,
  );
  const response = await fetch(upload.url, { method: 'POST', body: form });
  if (!response.ok) {
    throw new Error(
      `Uploading seed file ${file.fileName} to the storage failed with HTTP ${response.status}`,
    );
  }
}
