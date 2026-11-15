# Registry: Runtime: Redis, logger, shutdown, timeouts

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **withTimeout** — `src/common/async/with-timeout.ts` — bounds a promise, rejects with **TimeoutError** (`src/common/async/timeout.error.ts`); does not cancel.
- **Redis** — `src/infra/redis/` — `RedisService`, `RedisReadinessCheck`. [whole folder: the shared client and its check]
- **Logger** — `src/infra/logger/` — pino, the request logger, `serializeError`, redaction. [whole folder: the logger and its redaction]
- **Shutdown** — `src/infra/shutdown/` — the shutdown deadline. [whole folder: the deadline and what it reports]
- **shutdownOnSignals** — `src/infra/shutdown/shutdown-on-signals.ts` — closes on SIGTERM/SIGINT under SHUTDOWN_DEADLINE_MS (`src/infra/shutdown/close-with-deadline.ts`).
- **trackClosing** — `src/infra/shutdown/track-closing.ts` — a resource the deadline names if it hangs.
