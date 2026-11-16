# Architecture of the JAZLA API

The layout and the conventions of the API, in one place. The rule files hold the checks; this file holds the shape. Paths are relative to `services/api/`. A change to the layout is made here in the same change that makes it in the code.

## What exists today

```
.nvmrc  .env.example  .gitignore  package.json  pnpm-lock.yaml  tsconfig.json  tsconfig.build.json  nest-cli.json
jest.config.ts  eslint.config.mjs  .prettierrc  prisma.config.ts (Prisma CLI: schema, migrations, DATABASE_URL)
openapi.json                  the OpenAPI document, generated (pnpm openapi:generate), committed, checked (openapi:check)
docker-compose.yml            postgis/postgis:17-3.5 (host port JAZLA_DB_PORT, 5434; databases jazla, jazla_test),
                              redis:7-alpine (host port JAZLA_REDIS_PORT, 6380) and MinIO (Chainguard build, S3 API
                              on JAZLA_MINIO_PORT, 9002; console 9003); pnpm infra:up / infra:down
docker/postgres/              00-create-test-database.sql (first start only)
docker/minio/                 entrypoint.sh (server, then bucket setup, then healthy), init-buckets.sh (jazla-public,
                              jazla-private and their -test twins; public: anonymous GetObject only)
prisma/
  schema.prisma               generator (prisma-client, CommonJS) and datasource only
  models/audit.prisma         AuditLog -> audit_logs
  models/idempotency.prisma   IdempotencyKey -> idempotency_keys
  models/media.prisma         Media -> media (enums media_visibility, media_status, media_rejection_reason)
  models/users.prisma         User -> users, UserAccess -> user_access (enum audience; organisation -> vendors)
  models/vendors.prisma       Vendor -> vendors, VendorApplication -> vendor_applications,
                              VendorApplicationDocument -> vendor_application_documents, VendorCommissionChange ->
                              vendor_commission_changes (enums vendor_status, vendor_application_status,
                              vendor_application_document_kind)
  models/catalog.prisma       Category -> categories, MeatType -> meat_types, CuttingStyle -> cutting_styles,
                              ExclusionItem -> exclusion_items, CuttingPackagingIncompatibility ->
                              cutting_packaging_incompatibilities, Product -> products, ProductImage, ProductSize,
                              ProductCutting, ProductPackagingOption (product_packagings), ProductExclusion,
                              ProductChangeRequest (enums product_status, product_fulfilment, product_packaging,
                              product_change_request_status)
  models/auth.prisma          OtpChallenge -> otp_challenges, AuthSession -> auth_sessions, RefreshToken ->
                              refresh_tokens (enums device_platform, auth_session_revocation_reason)
  migrations/                 20261113150318_init: PostGIS extension, audit_logs; 20261113224826_idempotency_keys;
                              20261114151242_media; 20261114192800_users_and_auth (with two check constraints);
                              20261115120000_media_staged_uploads; 20261115205251_vendors (partial unique indexes and
                              check constraints written by hand); 20261115230905_catalog (check constraints, the
                              pending change request index and the public list's partial indexes by hand)
src/
  main.ts                     bootstrap: validates the environment, pino as Nest's logger, configureHttpApp,
                              shutdownOnSignals (the shutdown deadline), port from config; an invalid
                              environment prints its problems and exits with code 1
  create-admin.ts             pnpm admin:create <phone>: grants admin access (create-admin.module.ts)
  create-platform-vendor.ts   pnpm vendor:create-platform: creates the platform vendor (create-platform-vendor.module.ts)
  app.module.ts               imports config, logger, database, redis, queue, event bus, rate limit, auth (after
                              rate limit: guard order), health, media, vendors, catalog;
                              registers the global filter and pipe
  generate-openapi.ts         pnpm openapi:generate / openapi:check (Nest preview mode: nothing connects)
  config/                     env.schema.ts (zod), validate-env.ts, load-env.ts (the one reader of process.env),
                              namespaces app, logger, database, redis, queue, http (build-http-config.ts), rateLimit,
                              storage, media, sms, vendors (the IBAN key),
                              each with its -config.type.ts; is-postgres-url.ts, is-redis-url.ts,
                              is-cors-origin.ts, integer-env-var.ts, *.constants.ts
  common/
    errors/                   app-error.ts, error-code.enum.ts, error-messages.constants.ts,
                              error-statuses.constants.ts, field-error.type.ts, ... (no package import: R8)
    filters/                  all-exceptions.filter.ts, error-response-body.interface.ts, error-response.dto.ts,
                              field-error.dto.ts, http-status-error-codes.constants.ts
    decorators/               api-error-responses.decorator.ts, bearer-auth.constants.ts, the rate limit policy
                              (options, validation, key, constants)
    pipes/                    app-validation.pipe.ts, to-field-errors.ts
    events/                   domain-event.ts (DomainEvent, plain TypeScript: domain/ may extend it),
                              event-name.type.ts, event-name-of.type.ts, domain-event-class.type.ts
    files/                    detect-content-type.ts (magic numbers), content signatures, sanitize-file-name.ts
    phone/                    normalize-saudi-mobile-number.ts (E.164 or null), mask-phone-number.ts (the masking
                              helper for phone numbers)
    sms/                      measure-sms-text.ts (GSM-7 or UCS-2, segments), the GSM-7 alphabet, segment sizes
    i18n/  request-id/  async/
    auth/                     audiences, AuthenticatedUser, the AccessTokenVerifier and VendorStatusChecker
                              interfaces, resolve-route-audience.ts
    guards/                   authentication.guard.ts (global; audience from the route prefix), route-audience.check.ts
                              (startup refuses an endpoint with neither an audience nor @Public()),
                              organisation-status.guard.ts (global, after it: VENDOR_SUSPENDED on vendor routes),
                              vendor-route.check.ts (startup refuses a public vendor route or no status checker)
    crypto/                   AES-256-GCM encrypt and decrypt with key ids (data at rest: IBANs)
    pagination/               keyset lists: Page, PageRequest, cursor codec, toPage (plain TypeScript, domain-safe)
    dto/                      id-param.dto.ts (the :id parameter), page-query.dto.ts (every list's query)
    text/                     to-latin-digits.ts, remove-format-characters.ts
    interceptors/             empty
  infra/
    http/                     configure-http-app.ts (the HTTP layer in order: request logger, helmet, CORS,
                              pre-routing rate limit, JSON-only bodies, /v1, /docs), require-json-body.ts, constants
    api-docs/                 build-openapi-document.ts, setup-api-docs.ts (/docs, /docs-json), constants
    rate-limit/               rate-limit.module.ts (@nestjs/throttler), rate-limit.guard.ts (global; fail open
                              or closed), pre-routing-rate-limiter.ts (Express middleware), rate-limit-policy.check.ts
                              (startup check of @RateLimit declarations), redis-throttler-storage.ts (Redis),
                              increment-hits.script.ts, rate-limit-keys.ts (hashed, hash-tagged), errors, constants,
                              rate-limit.decorator.ts and skip-rate-limit.decorator.ts (the only users of the
                              throttler's decorators, R19)
    database/                 database.module.ts (global), prisma.service.ts, db-context.ts (the query client),
                              transaction-runner.ts + run-in-transaction.ts (ambient transactions, retries),
                              track-query-failures.ts, run-after-commit.ts + run-isolated-callback.ts,
                              transaction scope (with its state), idempotency-runner.ts (runOnce, table
                              idempotency_keys), map-prisma-error.ts, map-constraint-violation.ts (a named constraint
                              to its code), keyset-after.ts + keyset-order.constants.ts (keyset pages);
                              generated/prisma/ (not committed)
    audit/                    audit-log-writer.ts (an audit_logs entry inside the caller's transaction), audit.module.ts
    redis/                    redis.module.ts (global), redis.service.ts (shared client), redis-readiness.check.ts
                              (answers, on the configured database)
    queue/                    queue.module.ts (BullMQ root), queue-registration.module.ts, bounded-queue.ts
                              (adds fail fast), job-processor.ts + job-lifecycle-logger.ts (worker events),
                              build-job-id.ts, keep-job-scheduled.ts (repeating jobs), provide-workers.ts
                              (processors and schedulers start only with QUEUE_WORKERS_ENABLED), default job
                              options, queue names (media-cleanup)
    event-bus/                event-bus.module.ts, event-publisher.ts (publish(EventClass, event)),
                              on-domain-event.decorator.ts; the event types are in src/common/events/
    health/                   health.controller.ts: GET /v1/health (liveness), GET /v1/health/ready
                              (readiness.service.ts; 503 from the start of shutdown, shutdown-state.ts);
                              response DTOs in dto/
    logger/                   logger.module.ts, create-logger-params.ts, create-request-logger.ts (the pino-http
                              middleware configureHttpApp mounts first), serializers (error, request, response),
                              redact-sensitive-fields.ts, logged header allowlists
    shutdown/                 shutdown-on-signals.ts + close-with-deadline.ts (SIGTERM/SIGINT close under
                              SHUTDOWN_DEADLINE_MS, then exit 1 naming what was still closing), closing-resources
                              (what workers, queues, the database and Redis report while they close)
  integrations/
    storage/                  the reference integration: storage.port.ts (StoragePort, STORAGE_PORT), .types.ts,
                              .errors.ts (StorageError: reason, retryable), .service.ts (bucket per visibility, public
                              URLs, expiries), .module.ts (STORAGE_PROVIDER), index.ts, testing.ts (the fake, for
                              tests only), providers/s3.provider.ts
                              (AWS SDK v3; MinIO with path style), providers/fake.provider.ts (in memory, enforces
                              the upload policy)
    sms/                      the reference for ordered fallback: sms.port.ts (SmsPort, SMS_PORTS: the ordered
                              list), .types.ts, .errors.ts (SmsError: reason, retryable; SmsNotSentError: every
                              attempt; SmsConfigurationError), .service.ts (normalise, try in order with
                              SMS_PROVIDER_TIMEOUT_MS each, log masked), .module.ts (SMS_PROVIDERS), index.ts,
                              testing.ts, providers/log.provider.ts (development only), providers/fake.provider.ts
  modules/
    users/                    CRUD-shaped, no controller: users.service.ts (users, staff access in user_access)
    auth/                     the reference four-layer module: phone and OTP sign-in scoped to one audience.
                              api/ (public.controller.ts: otp/request, otp/verify, refresh, logout under
                              /v1/public/auth; customer, vendor, kitchen, admin controllers: me, auth/logout-all),
                              application/ (request-otp, verify-otp, refresh-session, logout, logout-all,
                              get-current-user), domain/ (otp-challenge, refresh-token, auth-session entities;
                              ports/; fakes/), infrastructure/ (Prisma repositories and mappers, hmac-otp-codes,
                              jwt-access-tokens, random-refresh-token-secrets, sms-otp-sender,
                              rate-limited-otp-requests, tracked-detached-work, system-clock)
    media/                    CRUD-shaped: media.service.ts (request, confirm, confirm own, download link, files,
                              public URLs in bulk, removeExpiredUploads), controllers/ (customer, vendor, admin:
                              uploads and confirm), upload-purposes.constants.ts (UPLOAD_PURPOSES),
                              audience-upload-purposes.constants.ts, dto/, media-cleanup.processor.ts and
                              .scheduler.ts (queue media-cleanup), types
    vendors/                  four layers: applications and their review, vendors (status, commission and its
                              history, profile), the platform vendor. api/ (customer, vendor, admin, public
                              controllers), application/ (a use case per class), domain/ (Iban, the review and
                              status state machines, entities, ports, fakes), infrastructure/ (Prisma repositories,
                              AES-GCM IBAN cipher, MediaService and UsersService adapters, the status checker);
                              platform-vendor.module.ts (what the command needs); exports VendorDirectory
    catalog/                  four layers: admin lists (categories, meat types, cutting styles, "without" items),
                              cutting and packaging rules, products (sizes, cuttings, packagings, exclusions,
                              images), their review (state machine), change requests on published products,
                              public browsing. api/ (vendor, admin, public controllers), application/,
                              domain/ (Product rules, ProductStatusMachine, ports, fakes), infrastructure/
                              (Prisma repositories, MediaService and VendorDirectory adapters)
test/
  *.e2e-spec.ts               health, errors, request-id, database, queue, event-bus, api-docs, http-security,
                              rate-limit, startup, logging, redis-logging, shutdown, media (fake storage),
                              media-storage (MinIO), auth, auth-guard, media-endpoints, vendors,
                              vendors-logging, vendor-routes-suspension (walks every vendor route), catalog;
                              jest-e2e.json
  support/                    test-only code: createHttpApp() (the real app set up as main.ts does; no workers
                              unless `workers` turns one on, enableWorkers), probe
                              controllers, queue and event probes, start-api.cjs (starts main.ts with variables),
                              auth-client.ts and vendor-journey.ts (sign-ins, uploads, applications, approvals)
  types/                      compile-time tests (pnpm test:types)
lint-fixtures/                fixtures that prove each lint rule: src/ mirrors the layout (fake integrations
                              sms and mail, modules catalog and orders, orders with domain/), own tsconfig.json;
                              excluded from build, Jest and pnpm lint
.husky/                       git hooks (husky): pre-commit (lint-staged, the staged-files guard staged-guard.mjs,
                              registry check), commit-msg (commitlint); install.mjs, run by `prepare`; lint-staged.config.mjs, commitlint.config.mjs, .prettierignore
scripts/check-lint-rules.mjs  pnpm lint:rules: lints the fixtures and checks each against its first line
scripts/e2e.mjs               pnpm test:e2e: checks the database and Redis, migrates jazla_test, points storage at
                              the -test buckets, runs Jest against the test database and Redis database
../../.github/workflows/api-ci.yml   CI: every command of CLAUDE.md on pull requests and pushes touching services/api
```

## Reference implementations

The first of each kind becomes the reference, which later ones copy file for file. Add a line when you build the first of a kind.

- **Integration, one provider, no fallback** (storage): `src/integrations/storage/` — port and token, types, errors with `retryable`, service, module selecting the provider from config, `index.ts`, `testing.ts` (the fake), `providers/` with the vendor provider and the fake.
- **Integration with ordered fallback** (sms): `src/integrations/sms/` — the storage shape, plus an ordered list of ports (`SMS_PORTS`), a timeout per call, fallback only on a retryable error, one `SmsNotSentError` carrying every attempt, startup refusing unknown or unconfigured providers. Mail and push copy it.
- **CRUD-shaped module** (media): `src/modules/media/` — service through `DbContext`, conditional updates on the status, a processor and its schedule, and a controller per audience (`controllers/`) that maps through `to-*-response.ts` functions.
- **Four-layer module** (auth): `src/modules/auth/` — `api/` (a controller per audience, DTOs, mapping), `application/` (one use case per class, tested against the fakes through `auth-use-cases.fake.ts`), `domain/` (entities with the rules, one port per file with its token, fakes in `fakes/`), `infrastructure/` (Prisma repositories with mappers, other port implementations); only `auth.module.ts` binds ports. A use case that must commit before refusing returns an outcome from its transaction and throws after it.

- **List endpoint** (vendors): keyset pagination as `http.md`, "Lists" — `PageQueryDto`, a port returning `Page<T>`, `keysetAfter` + `KEYSET_ORDER` + `toPage` in the repository, a `<noun>-page-response.dto.ts`.
- **Second global guard behind a common interface** (`OrganisationStatusGuard` + `VendorStatusChecker`): the interface in `src/common/auth/`, bound by the module that knows the data, a startup check refusing routes that could escape it.

None built yet: payments integration. Until then follow ARCHITECTURE.md and the area's rule file.

## Target layout (folders appear when their step comes)

```
prisma/                       schema.prisma (base) + models/<domain>.prisma, one per domain; migrations beside it
src/
  config/                     environment schema and typed config; the only place that reads env vars
  common/                     framework-level code with no business meaning
    errors/                   AppError and the error code list
    events/                   DomainEvent and its types
    money/                    the Money helper: all arithmetic on halala amounts
    filters/ guards/ interceptors/ decorators/ pipes/
  infra/                      infrastructure we run ourselves; never imports from modules/
    health/                   liveness and readiness (database and redis)
    http/                     the HTTP setup shared by main.ts and the e2e tests (helmet, CORS, proxies, body limit)
    api-docs/                 the OpenAPI document and /docs
    rate-limit/               rate limiting: the throttler and its Redis storage
    database/                 the Prisma service, geo helpers (PostGIS raw SQL)
    redis/                    the shared Redis client and its readiness check
    queue/                    BullMQ connection, default job options, queue names, JobProcessor, buildJobId,
                              provideWorkers; no processor
    shutdown/                 the shutdown deadline
    realtime/                 socket gateway, room conventions, the publishing port
    event-bus/                in-process event bus: EventPublisher, @OnDomainEvent (wraps @nestjs/event-emitter)
    logger/
  integrations/               external services, one folder per capability
    mail/ sms/ push/ payments/ storage/ delivery/ zatca/ bnpl/
      <capability>.port.ts              interface + injection token
      <capability>.types.ts             argument and result types of the port
      <capability>.errors.ts            errors the capability raises
      <capability>.service.ts           what the rest of the API calls
      <capability>.module.ts            selects providers from configuration
      index.ts                          public entry; nothing outside imports past it
      testing.ts                        test-only entry: the fake and test helpers (R22)
      providers/<vendor>.provider.ts    one file per vendor
      providers/fake.provider.ts        fake used by tests
  modules/                    business domains, one folder each
    auth, vendors, catalog, orders, checkout, payments, refunds, wallet, finance: four layers
      index.ts                public entry: re-exports what other modules may use (R7)
      <module>.module.ts
      api/                    controllers/<audience>.controller.ts, dto/
      application/            one class per use case
      domain/                 entities, state machines, rules, ports, events (plain TypeScript);
                              fakes/ holds the in-memory port fakes unit tests use
      infrastructure/         Prisma repositories and mappers
    every other module (promoted when it gains a state machine or money logic)
      index.ts  <module>.module.ts  <module>.service.ts
      controllers/<audience>.controller.ts   dto/   events/
test/                         e2e tests, one file per module: <module>.e2e-spec.ts
```

## Platform

- NestJS 12 as a CommonJS project, TypeScript 6 `strict`, Jest, ESLint 10 with typescript-eslint, Node 26 or later, pnpm. A standalone project: its own `package.json` and lockfile, no workspace. Reasons in `.claude/DECISIONS.md`.
- PostgreSQL 17 with PostGIS, through Prisma. Redis 7 with BullMQ 6 (through `@nestjs/bullmq`) and ioredis 6. Local images: `postgis/postgis:17-3.5` and `redis:7-alpine`, started together by `pnpm infra:up`.
- Object storage is S3-compatible, reached only through the storage port, with presigned direct uploads.
- Payment gateway: Geidea, behind the payments port.
- Auth: phone number + OTP, a sign-in scoped to one audience, JWT access tokens (HS256, keys with ids) and rotating refresh tokens (`@nestjs/jwt` 12).
- HTTP: `@nestjs/swagger` 12, helmet 8, `@nestjs/throttler` 6 with our own Redis storage.

## Routes

- Global prefix: `/v1`.
- Health: `GET /v1/health`. It has no audience segment.
- API documentation: `/docs` and `/docs-json`, outside the prefix.
- Every route is under an audience prefix or marked `@Public()`; the authentication guard denies anything else, and the application refuses to start with it.
- Business routes are grouped by audience, starting with the first business module: `/v1/public/...` (no authentication), `/v1/customer/...`, `/v1/vendor/...`, `/v1/kitchen/...`, `/v1/admin/...`. One controller per audience.
- Incoming webhooks: `/v1/webhooks/<capability>/<provider>`, for example `/v1/webhooks/payments/geidea`. Where the webhook controller lives is still open (`.claude/DECISIONS.md`).

## Conventions (each rule lives in one file; this is where)

| Topic | Owner |
|---|---|
| Money, time, errors and the error body, type safety, secrets and logs | `.claude/rules/invariants.md` |
| Folders, boundaries (lint ids), file names, aliases | `.claude/rules/code-structure.md` |
| Schema, migrations, table conventions, transactions | `.claude/rules/database.md` |
| Module shapes, the ledger, events, jobs, realtime | `.claude/rules/modules.md` |
| Integrations, fallback, payments, zatca | `.claude/rules/integrations.md` |
| API documentation, HTTP security, rate limits, request id, proxies | `.claude/rules/http.md` |
| Tests and evidence | `.claude/rules/testing.md` |
| Why each of these was decided | `.claude/DECISIONS.md` |

Facts that are not rules: the request id is the incoming `x-request-id` when safe (at most 128 of `A-Z a-z 0-9 . _ : -`), otherwise a UUID, returned in the header, on every log line and in error bodies. Logs are pino: readable in development, JSON in production, silent in test; every request is logged when it completes (info 2xx/3xx, warn 4xx, error 5xx). Configuration is validated at startup by the zod schema in `src/config/`; the variables are listed in `.env.example`. A shutdown (SIGTERM or SIGINT) drains readiness, gives jobs 25 s, and ends within SHUTDOWN_DEADLINE_MS (28 s by default), exiting with code 1 and naming what was still closing if it must.

## The product, in brief

A multi-vendor meat and livestock ordering platform for Saudi Arabia, Arabic-first, priced in SAR.

- JAZLA sells its own products, and partner merchants list theirs. A cart and an order belong to one seller, and that seller fulfils the order: JAZLA's orders are handled by the admin, a merchant's by that merchant.
- Contracted kitchens cook JAZLA's meat for cooking orders.
- Each merchant has a commission percentage. Merchants are paid by weekly transfers and see sales, commission, net amount and transfers.
- A delivery company delivers and collects cash on delivery, which is reconciled later.
- Orders range from small meat orders to whole animals worth thousands of riyals. Refunds, partial refunds and weight adjustments are routine. Demand spikes sharply around Eid al-Adha.
