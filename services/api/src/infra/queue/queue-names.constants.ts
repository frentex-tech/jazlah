/**
 * Every queue name in the API, in one place. Empty until a module brings its first
 * queue: the module that owns the work adds its name here (`kebab-case`, no `:`),
 * registers the queue with `BullModule.registerQueue({ name: QUEUE_NAMES.<key> })`
 * and keeps the processor (`.claude/rules/modules.md`, "Events, jobs and realtime").
 */
export const QUEUE_NAMES = {} as const satisfies Readonly<
  Record<string, string>
>;
