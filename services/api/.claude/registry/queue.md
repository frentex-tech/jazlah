# Registry: Queue and jobs

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **Queue** — `src/infra/queue/` — `QueueModule` (the BullMQ connection), `queue.constants.ts`. [whole folder: internals of the entries below]
- **QueueRegistrationModule** — `src/infra/queue/queue-registration.module.ts` — the only way to register a queue (R15).
- **BoundedQueue** — `src/infra/queue/bounded-queue.ts` — `add` fails fast with 503 while Redis is down.
- **JobProcessor** — `src/infra/queue/job-processor.ts` — base class of every processor (R17, R18).
- **buildJobId** — `src/infra/queue/build-job-id.ts` — a deterministic job id.
- **Default job options** — `src/infra/queue/default-job-options.constants.ts` — `DEFAULT_JOB_OPTIONS`.
- **provideWorkers** — `src/infra/queue/provide-workers.ts` — processors and schedulers, started only where QUEUE_WORKERS_ENABLED.
- **keepJobScheduled** — `src/infra/queue/keep-job-scheduled.ts` — registers a repeating job; `src/infra/queue/job-schedule.type.ts`, `src/infra/queue/job-schedule-handle.type.ts`.
- **Queue names** — `src/infra/queue/queue-names.constants.ts` — `QUEUE_NAMES`.
