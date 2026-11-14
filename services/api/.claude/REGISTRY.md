# Registry: the index of shared code

One line per building block: name, path, purpose; the detail is in that file's doc comment. Check here before writing anything shared, then confirm in the code, which is the truth. Paths are relative to `services/api/`.

**Keeping it current.** The change that adds, renames, moves or deletes shared code (under `src/common/`, `src/infra/`, `src/integrations/`, and each module export) updates its line: `- **Name** — \`path\` — a few words`. Every shared source file is named by a line or sits in a folder whose line ends `[whole folder: <reason>]` (only a folder that is one unit, reached through the entries beside it); `node .claude/hooks/check-registry.mjs` enforces it.

**Reserved names** (decided, not built; create them only under these names and record the path here): **Money** in `src/common/money/` (all halala arithmetic); **the realtime publishing port** in `src/infra/realtime/` (beside the gateway modules never import); **the time helper** (Asia/Riyadh business calendar); **the masking helper** (phones and addresses in logs; the phone part is `maskPhoneNumber` below).

<!-- entries-start: the check script reads every backticked path below this line -->

**Reference implementations** (the first of each kind, which later ones copy): ARCHITECTURE.md, "Reference implementations".

## config

- **Typed configuration** — `src/config/` — `AppConfigModule`, `loadEnv` (the only reader of `process.env`), one namespace per area; `findMissingProviderVariables` (`src/config/find-missing-provider-variables.ts`); inject `@Inject(xConfig.KEY)`.

## common

- **withTimeout** — `src/common/async/with-timeout.ts` — bounds a promise, rejects with **TimeoutError** (`src/common/async/timeout.error.ts`); does not cancel.
- **AppError** — `src/common/errors/app-error.ts` — the one error class business code throws; options `src/common/errors/app-error-options.interface.ts`.
- **FieldError** — `src/common/errors/field-error.type.ts` — one invalid field in VALIDATION_FAILED details.
- **NonErrorThrownError** — `src/common/errors/non-error-thrown.error.ts` — what the filter logs for a thrown non-Error.
- **Domain events** — `src/common/events/` — `DomainEvent` and its types, plain TypeScript. [whole folder: the base class and its types]
- **ApiErrorResponses** — `src/common/decorators/api-error-responses.decorator.ts` — documents an endpoint's errors; `BEARER_AUTH_SCHEME` `src/common/decorators/bearer-auth.constants.ts`.
- **Rate limit policy** — `src/common/decorators/to-rate-limit-policy.ts` — validates `@RateLimit` numbers: `src/common/decorators/rate-limit-options.type.ts`, `src/common/decorators/rate-limit-policy.type.ts`, `src/common/decorators/invalid-rate-limit-options.error.ts`, `src/common/decorators/route-rate-limit-key.ts`, `src/common/decorators/rate-limit.constants.ts`.
- **Rate limit declarations** — `src/common/decorators/to-rate-limit-declaration.ts` — what `@RateLimit` stores (`src/common/decorators/rate-limit-declaration.type.ts`, `src/common/decorators/rate-limit-settings.type.ts`); `src/common/decorators/resolve-rate-limit-policy.ts` turns one into a policy.
- **Public** — `src/common/decorators/public.decorator.ts` — a route outside the audience prefixes needing no sign-in; key `src/common/decorators/public-route.constants.ts`.
- **CurrentUser** — `src/common/decorators/current-user.decorator.ts` — the request's `AuthenticatedUser`.
- **Error filter** — `src/common/filters/all-exceptions.filter.ts` — writes every error (`src/common/filters/error-response-body.interface.ts`, `src/common/filters/http-status-error-codes.constants.ts`).
- **ErrorResponseDto** — `src/common/filters/error-response.dto.ts` — the documented error body, with `src/common/filters/field-error.dto.ts`.
- **Language** — `src/common/i18n/resolve-language.ts` — `Accept-Language` to `src/common/i18n/language.type.ts`; `src/common/i18n/localized-text.type.ts`.
- **Validation pipe** — `src/common/pipes/app-validation.pipe.ts` — the global pipe; `src/common/pipes/to-field-errors.ts`.
- **Request id** — `src/common/request-id/resolve-request-id.ts` — keeps a safe `x-request-id` or makes one; `src/common/request-id/request-id.constants.ts`.
- **detectContentType** — `src/common/files/detect-content-type.ts` — a file's type from its first bytes: `src/common/files/content-signatures.constants.ts`, `src/common/files/content-signature.type.ts`, `src/common/files/detectable-content-type.type.ts`.
- **sanitizeFileName** — `src/common/files/sanitize-file-name.ts` — a client's file name made safe to store and show.
- **normalizeSaudiMobileNumber** — `src/common/phone/normalize-saudi-mobile-number.ts` — E.164 (`+9665XXXXXXXX`) from typed forms, or null.
- **SaudiMobileNumber** — `src/common/phone/saudi-mobile-number.decorator.ts` — DTO decorator: every form in, E.164 out.
- **maskPhoneNumber** — `src/common/phone/mask-phone-number.ts` — what logs hold instead of a number.
- **toLatinDigits** — `src/common/text/to-latin-digits.ts` — Arabic-Indic digits to Latin.
- **measureSmsText** — `src/common/sms/measure-sms-text.ts` — an SMS text's encoding and segments; `src/common/sms/gsm-7-alphabet.constants.ts`, `src/common/sms/sms-segment-sizes.constants.ts`, `src/common/sms/sms-encoding.type.ts`, `src/common/sms/sms-text-measure.type.ts`.
- **Audiences** — `src/common/auth/audiences.constants.ts` — `AUDIENCES`; `src/common/auth/audience.type.ts`, `src/common/auth/route-audience.type.ts`, `src/common/auth/authenticated-user.type.ts`; plain TypeScript, importable from `domain/`. A lookup table: the Prisma enum `audience` and the route prefixes follow it.
- **resolveRouteAudience** — `src/common/auth/resolve-route-audience.ts` — a controller path's audience, `public`, or null.
- **AccessTokenVerifier** — `src/common/auth/access-token-verifier.interface.ts` — what the guard verifies with; `src/common/auth/access-token-verifier.constants.ts`, `src/common/auth/access-token-verification.type.ts`; implemented by auth.
- **AuthenticationGuard** — `src/common/guards/authentication.guard.ts` — the global guard: audience from the route, deny by default.
- **RouteAudienceCheck** — `src/common/guards/route-audience.check.ts` — startup fails on an endpoint with no audience and no `@Public()` (`src/common/guards/route-without-audience.error.ts`).

## infra

- **Health** — `src/infra/health/` — `GET /v1/health`, `/v1/health/ready`, `ShutdownState`. [whole folder: the health endpoints and their checks]
- **HTTP setup** — `src/infra/http/` — `configureHttpApp`, for `main.ts` and the e2e tests. [whole folder: configureHttpApp and its parts]
- **API docs** — `src/infra/api-docs/` — `buildOpenApiDocument`, `setupApiDocs`. [whole folder: the one OpenAPI document]
- **Rate limiting** — `src/infra/rate-limit/` — `RateLimitModule`: guard, pre-routing limiter, Redis storage, startup check. [whole folder: the throttler setup behind the entries below]
- **RateLimiter** — `src/infra/rate-limit/rate-limiter.ts` — `consume(options, key)`: a limit counted by a keyed hash the caller supplies.
- **RateLimit, SkipRateLimit** — `src/infra/rate-limit/rate-limit.decorator.ts`, `src/infra/rate-limit/skip-rate-limit.decorator.ts` — instead of the throttler's decorators (R19); numbers inline or `from` config.
- **Event bus** — `src/infra/event-bus/` — `EventPublisher.publish(EventClass, event)`, `@OnDomainEvent`. [whole folder: the event-emitter wrapper (R16)]
- **Database** — `src/infra/database/` — `DatabaseModule`, `PrismaService` (infrastructure only). [whole folder: internals of the entries below]
- **DbContext** — `src/infra/database/db-context.ts` — the client repositories and CRUD services query through.
- **TransactionRunner** — `src/infra/database/transaction-runner.ts` — opens transactions (`src/infra/database/run-in-transaction.ts`).
- **runAfterCommit** — `src/infra/database/run-after-commit.ts` — a callback after the outermost commit.
- **IdempotencyRunner** — `src/infra/database/idempotency-runner.ts` — `runOnce(operation, key, work)`.
- **mapPrismaError** — `src/infra/database/map-prisma-error.ts` — known database errors to `AppError`.
- **Queue** — `src/infra/queue/` — `QueueModule` (the BullMQ connection), `queue.constants.ts`. [whole folder: internals of the entries below]
- **QueueRegistrationModule** — `src/infra/queue/queue-registration.module.ts` — the only way to register a queue (R15).
- **BoundedQueue** — `src/infra/queue/bounded-queue.ts` — `add` fails fast with 503 while Redis is down.
- **JobProcessor** — `src/infra/queue/job-processor.ts` — base class of every processor (R17, R18).
- **buildJobId** — `src/infra/queue/build-job-id.ts` — a deterministic job id.
- **Default job options** — `src/infra/queue/default-job-options.constants.ts` — `DEFAULT_JOB_OPTIONS`.
- **provideWorkers** — `src/infra/queue/provide-workers.ts` — processors and schedulers, started only where QUEUE_WORKERS_ENABLED.
- **keepJobScheduled** — `src/infra/queue/keep-job-scheduled.ts` — registers a repeating job; `src/infra/queue/job-schedule.type.ts`, `src/infra/queue/job-schedule-handle.type.ts`.
- **Redis** — `src/infra/redis/` — `RedisService`, `RedisReadinessCheck`. [whole folder: the shared client and its check]
- **Logger** — `src/infra/logger/` — pino, the request logger, `serializeError`, redaction. [whole folder: the logger and its redaction]
- **Shutdown** — `src/infra/shutdown/` — the shutdown deadline. [whole folder: the deadline and what it reports]
- **shutdownOnSignals** — `src/infra/shutdown/shutdown-on-signals.ts` — closes on SIGTERM/SIGINT under SHUTDOWN_DEADLINE_MS (`src/infra/shutdown/close-with-deadline.ts`).
- **trackClosing** — `src/infra/shutdown/track-closing.ts` — a resource the deadline names if it hangs.

## integrations (each line: providers, the config key that selects them, fallback or not)

- **Storage** — `src/integrations/storage/` — presigned uploads and downloads, metadata, first bytes, delete. Providers: `s3` (`src/integrations/storage/providers/s3.provider.ts`), by `STORAGE_PROVIDER`; no fallback. Fake: `src/integrations/storage/providers/fake.provider.ts` via `testing.ts` (R22). [whole folder: reached through index.ts and testing.ts]
- **SMS** — `src/integrations/sms/` — one text to one Saudi mobile; logs the provider and masked number, never the text. Providers: `log` (`src/integrations/sms/providers/log.provider.ts`, development only), in order by `SMS_PROVIDERS`; ordered fallback; Msegat pending its documentation (DECISIONS.md). Fake: `src/integrations/sms/providers/fake.provider.ts` via `testing.ts` (R22). [whole folder: reached through index.ts and testing.ts]

## Module exports (the only things another module may use)

- **MediaService** — `src/modules/media/media.service.ts` — `requestUpload`, `confirmUpload`, `getDownloadLink`; `src/modules/media/dto/request-upload.dto.ts`, types in `src/modules/media/index.ts`.
- **UsersService** — `src/modules/users/users.service.ts` — find or create users by phone, staff access, `grantAdminAccess`; types in `src/modules/users/index.ts`.
- **AuthModule** — `src/modules/auth/index.ts` — nothing to call: use `@CurrentUser()` and the audience prefixes.

## Lookup tables (extend, never duplicate)

- **Error codes** — `src/common/errors/error-code.enum.ts` — a new code also needs `src/common/errors/error-messages.constants.ts` and `src/common/errors/error-statuses.constants.ts`. Never rename, remove or reuse one.
- **Queue names** — `src/infra/queue/queue-names.constants.ts` — `QUEUE_NAMES`.
- **Upload purposes** — `src/modules/media/upload-purposes.constants.ts` — `UPLOAD_PURPOSES`; a module needing uploads adds its own.
- **Configured rate limits** — `src/config/rate-limit.config.ts` — `configured` (`src/config/configured-rate-limits.type.ts`).
- **Environment schema** — `src/config/env.schema.ts` — a new variable also goes in a namespace and `.env.example`.
- **SMS providers** — `src/config/sms-providers.constants.ts` — names SMS_PROVIDERS may list; variables in `src/config/sms-provider-variables.constants.ts`.
