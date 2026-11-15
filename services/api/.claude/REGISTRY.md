# Registry: the index of shared code

One line per building block: name, path, purpose; the detail is in that file's doc comment. Check here before writing anything shared, then confirm in the code, which is the truth. Paths are relative to `services/api/`.

**Keeping it current.** The change that adds, renames, moves or deletes shared code (anything under `src/common/`, `src/infra/`, `src/integrations/`, and each module export) updates its line: `- **Name** — \`path\` — a few words`. Every shared source file is named by a line, or sits in a folder whose line ends `[whole folder: <reason>]`; declare that only for a folder that is one unit, reached through the entries named beside it. `node .claude/hooks/check-registry.mjs` fails on a missing path, an uncovered file, a whole area, or a declaration without a reason.

**Reserved names** (decided, not built; create them only under these names and record the path here): **Money** in `src/common/money/` (all halala arithmetic); **the realtime publishing port** in `src/infra/realtime/` (beside the gateway modules never import); **the time helper** (Asia/Riyadh business calendar); **the masking helper** (phone numbers and addresses in logs).

<!-- entries-start: the check script reads every backticked path below this line -->

## Reference implementations (the first of each kind becomes the reference)

None built yet: integration with fallback (mail, sms, push), payments integration, four-layer module, CRUD module. Until then follow ARCHITECTURE.md and the area's rule file.

## config

- **Typed configuration** — `src/config/` — `AppConfigModule`, `loadEnv` (the only reader of `process.env`), one namespace per area (`app`, `logger`, `database`, `redis`, `http`, `rateLimit`); inject `@Inject(xConfig.KEY)`.

## common

- **withTimeout** — `src/common/async/with-timeout.ts` — bounds a promise; rejects with **TimeoutError** (`src/common/async/timeout.error.ts`); does not cancel the work.
- **AppError** — `src/common/errors/app-error.ts` — the one error class business code throws; options in `src/common/errors/app-error-options.interface.ts`.
- **FieldError** — `src/common/errors/field-error.type.ts` — one invalid field in VALIDATION_FAILED details.
- **NonErrorThrownError** — `src/common/errors/non-error-thrown.error.ts` — what the filter logs for a thrown non-Error.
- **Domain events** — `src/common/events/` — `DomainEvent`, `EventName`, `EventNameOf`, `DomainEventClass`: the event base class and its types, plain TypeScript. [whole folder: one unit, the base class and the three types that describe it]
- **ApiErrorResponses** — `src/common/decorators/api-error-responses.decorator.ts` — documents an endpoint's error responses.
- **Bearer scheme** — `src/common/decorators/bearer-auth.constants.ts` — `BEARER_AUTH_SCHEME`.
- **Rate limit policy** — `src/common/decorators/to-rate-limit-policy.ts` — validates `@RateLimit` options (`src/common/decorators/rate-limit-options.type.ts`) into a policy (`src/common/decorators/rate-limit-policy.type.ts`) or throws `src/common/decorators/invalid-rate-limit-options.error.ts`; counter key `src/common/decorators/route-rate-limit-key.ts`; limiter name and metadata keys `src/common/decorators/rate-limit.constants.ts`.
- **Error filter** — `src/common/filters/all-exceptions.filter.ts` — writes every error as `ErrorResponseBody` (`src/common/filters/error-response-body.interface.ts`); Nest status to code in `src/common/filters/http-status-error-codes.constants.ts`.
- **ErrorResponseDto** — `src/common/filters/error-response.dto.ts` — the documented error body, with `FieldErrorDto` (`src/common/filters/field-error.dto.ts`).
- **Language** — `src/common/i18n/resolve-language.ts` — `Accept-Language` to `Language` (`src/common/i18n/language.type.ts`); `LocalizedText` (`src/common/i18n/localized-text.type.ts`).
- **Validation pipe** — `src/common/pipes/app-validation.pipe.ts` — the global pipe; `toFieldErrors` (`src/common/pipes/to-field-errors.ts`).
- **Request id** — `src/common/request-id/resolve-request-id.ts` — keeps a safe `x-request-id` or makes one; limits in `src/common/request-id/request-id.constants.ts`.

## infra

- **Health** — `src/infra/health/` — `HealthModule`, `GET /v1/health` and `/v1/health/ready`, `ReadinessService`, `ShutdownState` (readiness 503 while draining). [whole folder: one unit, the health endpoints and the readiness check they serve]
- **HTTP setup** — `src/infra/http/` — `configureHttpApp`: the HTTP layer in order, for `main.ts` and the e2e tests. [whole folder: one unit, configureHttpApp with its constants and middleware]
- **API docs** — `src/infra/api-docs/` — `buildOpenApiDocument`, `setupApiDocs` (`/docs`). [whole folder: one unit, building and serving the one OpenAPI document]
- **Rate limiting** — `src/infra/rate-limit/` — `RateLimitModule`: the global guard, the pre-routing limiter, the Redis storage, the startup policy check. [whole folder: one unit, the throttler setup reached through RateLimitModule and the two decorators below]
- **RateLimit, SkipRateLimit** — `src/infra/rate-limit/rate-limit.decorator.ts`, `src/infra/rate-limit/skip-rate-limit.decorator.ts` — what endpoints use instead of the throttler's decorators (R19).
- **Event bus** — `src/infra/event-bus/` — `EventBusModule`, `EventPublisher.publish(EventClass, event)`, `@OnDomainEvent`, `InvalidEventError`. [whole folder: one unit, the wrapper around @nestjs/event-emitter (R16)]
- **Database** — `src/infra/database/` — `DatabaseModule`, `PrismaService` (infrastructure only). [whole folder: one unit; scope storage, errors, types and constants are internals of the entries below]
- **DbContext** — `src/infra/database/db-context.ts` — the client repositories and CRUD services query through.
- **TransactionRunner** — `src/infra/database/transaction-runner.ts` — what use cases open transactions with (`src/infra/database/run-in-transaction.ts`).
- **runAfterCommit** — `src/infra/database/run-after-commit.ts` — a callback after the outermost commit, isolated.
- **IdempotencyRunner** — `src/infra/database/idempotency-runner.ts` — `runOnce(operation, key, work)`: work that must happen exactly once.
- **mapPrismaError** — `src/infra/database/map-prisma-error.ts` — known database errors to `AppError`.
- **Queue** — `src/infra/queue/` — `QueueModule` (the BullMQ connection), timeouts in `queue.constants.ts`. [whole folder: one unit; job logging, errors and types are internals of the entries below]
- **QueueRegistrationModule** — `src/infra/queue/queue-registration.module.ts` — the only way to register a queue (R15).
- **BoundedQueue** — `src/infra/queue/bounded-queue.ts` — `add` fails fast with 503 while Redis is unavailable.
- **JobProcessor** — `src/infra/queue/job-processor.ts` — the base class of every processor (R17, R18).
- **buildJobId** — `src/infra/queue/build-job-id.ts` — a deterministic job id: stops duplicate enqueues only.
- **Default job options** — `src/infra/queue/default-job-options.constants.ts` — `DEFAULT_JOB_OPTIONS` for every queue.
- **Redis** — `src/infra/redis/` — `RedisModule`, `RedisService` (the one shared client; does not fail fast), `RedisReadinessCheck`. [whole folder: one unit, the shared client and its readiness check]
- **Logger** — `src/infra/logger/` — `LoggerModule` (pino), the request logger, `serializeError`, `redactSensitiveFields`. [whole folder: one unit, the logger setup and what a log line may hold]
- **Shutdown** — `src/infra/shutdown/` — the shutdown deadline. [whole folder: one unit, the deadline and the list of closing resources it reports]
- **shutdownOnSignals** — `src/infra/shutdown/shutdown-on-signals.ts` — closes the app on SIGTERM/SIGINT under SHUTDOWN_DEADLINE_MS (`closeWithDeadline`, `src/infra/shutdown/close-with-deadline.ts`).
- **trackClosing** — `src/infra/shutdown/track-closing.ts` — records a resource as closing, so the deadline names it if it hangs.

## integrations (each line: providers, the config key that selects them, fallback or not)

_Nothing registered yet._

## Module exports (the only things another module may use)

_Nothing registered yet._

## Lookup tables (extend, never duplicate)

- **Error codes** — `src/common/errors/error-code.enum.ts` — every code; a new one also needs its messages (`src/common/errors/error-messages.constants.ts`) and status (`src/common/errors/error-statuses.constants.ts`). Never rename, remove or reuse a code.
- **Queue names** — `src/infra/queue/queue-names.constants.ts` — `QUEUE_NAMES`, empty until the first queue.
- **Environment schema** — `src/config/env.schema.ts` — every variable with its default; a new one also goes in a namespace and `.env.example`.
