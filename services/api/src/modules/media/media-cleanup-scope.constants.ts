/**
 * Injection token of the uploads the cleanup acts on (MediaCleanupScope). Null, as the
 * media module provides it: every upload. e2e apps provide a scope of their own
 * (test/support/create-http-app.ts, create-queue-probe-app.ts).
 */
export const MEDIA_CLEANUP_SCOPE = Symbol('MEDIA_CLEANUP_SCOPE');
