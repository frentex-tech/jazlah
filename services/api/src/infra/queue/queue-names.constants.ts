/**
 * Every queue name in the API, in one place. The module that owns the work adds its
 * name here (`kebab-case`, no `:`), registers the queue with
 * `QueueRegistrationModule.register({ name: QUEUE_NAMES.<key> })` and keeps the
 * processor (`.claude/rules/modules.md`, "Jobs").
 */
export const QUEUE_NAMES = {
  /** Removes uploads not confirmed in time (media module). */
  mediaCleanup: 'media-cleanup',
} as const satisfies Readonly<Record<string, string>>;
