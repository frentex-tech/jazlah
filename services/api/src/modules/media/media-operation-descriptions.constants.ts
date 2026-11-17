import { MEDIA_RATE_LIMITS } from './media-rate-limits.constants';

/**
 * The parts of the upload endpoints' OpenAPI descriptions that the customer, vendor and
 * admin controllers share: the upload flow and the confirmation checks, for the client
 * developers who integrate them from `openapi.json` alone. Each controller puts its own
 * caller and its purposes (describeUploadPurposes) around them. Keep them true to
 * MediaService and the storage integration; the limits come from MEDIA_RATE_LIMITS.
 */
export const MEDIA_OPERATION_DESCRIPTIONS = {
  requestUpload: [
    'Step 1 of 3 of a file upload. The file never passes through this API: this returns a ticket for a direct upload to storage.',
    '',
    '1. Call this with the purpose, the file Content-Type and, optionally, its name. Nothing is uploaded yet.',
    '2. Before `expiresAt` (5 minutes after the request by default), send `POST` to `url` as `multipart/form-data`: first one text part for every entry of `fields`, name and value exactly as given (add none, change none), then the file itself as the **last** part, named `file`. Send no Authorization header to the storage. The storage answers 204 with no body when it stored the file. It refuses an empty file, a file larger than the purpose allows, a changed field or an expired ticket with an error status (4xx) and an XML body of its own, not this API error format. Until `expiresAt` the same ticket can be used again (after a network failure): the last upload replaces the earlier one.',
    '3. Only after the storage answered 204, and before `confirmBy` (1 hour after the request by default), confirm the file: `POST .../media/{mediaId}/confirm`. Only a confirmed file can be used, and only by the user who uploaded it.',
    '',
    'Read both times from the response: they are server settings and may change.',
    '',
    `Limits: ${MEDIA_RATE_LIMITS.address.limit} ticket requests a minute per client address and ${MEDIA_RATE_LIMITS.owner.limit} an hour per user; over them, 429 RATE_LIMITED with Retry-After.`,
    '',
    'Errors:',
    '- MEDIA_CONTENT_TYPE_NOT_ALLOWED (415): the purpose does not accept this `contentType`; `details.allowed` lists the types it accepts. Nothing was created.',
    '- VALIDATION_FAILED (400): a purpose this app may not upload, or a missing or too long `contentType` or `fileName`.',
    '- SERVICE_UNAVAILABLE (503): the storage or the database cannot be reached, or the upload limits cannot be counted right now (uploads are then refused). Nothing was created; try again shortly.',
  ].join('\n'),
  confirm: [
    'Step 3 of a file upload: call it once the storage answered 204 to the upload, before the ticket `confirmBy`. The path id is the ticket `mediaId`.',
    '',
    'The API checks the uploaded file: present, not empty, not larger than the purpose allows, its real type (read from the file first bytes) one the purpose accepts and equal to the `contentType` declared for the ticket. A file that passes is ready: give its `id` to the endpoint that uses it (a product `imageMediaIds`, the vendor `logoMediaId`, the documents of a vendor application). A file that fails is deleted for good: request a new ticket and upload again. Confirming before the upload finished therefore rejects the file (OBJECT_MISSING).',
    '',
    'Idempotent: confirming a ready file again returns it again; a rejected file answers the same MEDIA_UPLOAD_REJECTED again. Only the user who requested the ticket can confirm it.',
    '',
    `Limit: ${MEDIA_RATE_LIMITS.confirm.limit} confirmations a minute per client address; over it, 429 RATE_LIMITED with Retry-After.`,
    '',
    'Errors:',
    '- MEDIA_NOT_FOUND (404): no such file for this user: an unknown id, a file another user uploaded, or an unconfirmed upload already removed after its `confirmBy`.',
    '- MEDIA_UPLOAD_EXPIRED (410): `confirmBy` has passed. Request a new ticket and upload again.',
    '- MEDIA_UPLOAD_REJECTED (422): the file failed a check and was deleted. `details.reason`: OBJECT_MISSING (nothing was uploaded with the ticket), EMPTY_FILE, TOO_LARGE, TYPE_NOT_ALLOWED (the content is none of the accepted types), CONTENT_TYPE_MISMATCH (the content is another type than the declared `contentType`, a PNG declared as image/jpeg for example), or OWNER_DELETED (the account was deleted).',
    '- VALIDATION_FAILED (400): the id is not a UUID.',
    '- SERVICE_UNAVAILABLE (503): the storage or the database cannot be reached, or the limit cannot be counted right now. Confirm again shortly, before `confirmBy`.',
  ].join('\n'),
} as const;
