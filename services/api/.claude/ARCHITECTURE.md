# Architecture of the JAZLA API

The layout and the conventions of the API, in one place. The rule files hold the checks; this file holds the shape. Paths are relative to `services/api/`. A change to the layout is made here in the same change that makes it in the code.

## What exists today

```
.nvmrc  .env.example  .gitignore  package.json  pnpm-lock.yaml  tsconfig.json  tsconfig.build.json  nest-cli.json
jest.config.ts  eslint.config.mjs  .prettierrc  prisma.config.ts (Prisma CLI: schema, migrations, DATABASE_URL)
openapi.json                  the OpenAPI document, generated (pnpm openapi:generate), committed, checked (openapi:check)
docker-compose.yml            postgis/postgis:17-3.5 (host port JAZLA_DB_PORT, 5434; databases jazla, jazla_test)
                              and redis:7-alpine (host port JAZLA_REDIS_PORT, 6380); pnpm infra:up / infra:down
docker/postgres/              00-create-test-database.sql (first start only)
prisma/
  schema.prisma               generator (prisma-client, CommonJS) and datasource only
  models/audit.prisma         AuditLog -> audit_logs
  migrations/                 20261113150318_init: PostGIS extension, audit_logs
src/
  main.ts                     bootstrap: validates the environment, pino as Nest's logger, configureHttpApp,
                              shutdownOnSignals (the shutdown deadline), port from config; an invalid
                              environment prints its problems and exits with code 1
  app.module.ts               imports config, logger, database, redis, queue, event bus, rate limit, health;
                              registers the global filter and pipe
  generate-openapi.ts         pnpm openapi:generate / openapi:check (Nest preview mode: nothing connects)
  config/                     env.schema.ts (zod), validate-env.ts, load-env.ts (the one reader of process.env),
                              namespaces app, logger, database, redis, http (build-http-config.ts), rateLimit,
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
    i18n/  request-id/  async/
    guards/ interceptors/     empty
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
                              idempotency_keys), map-prisma-error.ts; generated/prisma/ (not committed)
    redis/                    redis.module.ts (global), redis.service.ts (shared client), redis-readiness.check.ts
                              (answers, on the configured database)
    queue/                    queue.module.ts (BullMQ root), queue-registration.module.ts, bounded-queue.ts
                              (adds fail fast), job-processor.ts + job-lifecycle-logger.ts (worker events),
                              build-job-id.ts, default job options, queue names (empty)
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
  integrations/               empty
  modules/                    empty
test/
  *.e2e-spec.ts               health, errors, request-id, database, queue, event-bus, api-docs, http-security,
                              rate-limit, startup, logging, redis-logging, shutdown; jest-e2e.json
  support/                    test-only code: createHttpApp() (the real app set up as main.ts does), probe
                              controllers, queue and event probes, start-api.cjs (starts main.ts with variables)
  types/                      compile-time tests (pnpm test:types)
lint-fixtures/                fixtures that prove each lint rule: src/ mirrors the layout (fake integrations
                              sms and mail, modules catalog and orders, orders with domain/), own tsconfig.json;
                              excluded from build, Jest and pnpm lint
.husky/                       git hooks (husky): pre-commit (lint-staged, the staged-files guard staged-guard.mjs,
                              registry check), commit-msg (commitlint); install.mjs, run by `prepare`; lint-staged.config.mjs, commitlint.config.mjs, .prettierignore
scripts/check-lint-rules.mjs  pnpm lint:rules: lints the fixtures and checks each against its first line
scripts/e2e.mjs               pnpm test:e2e: checks the database and Redis, migrates jazla_test, runs Jest against
                              the test database and Redis database
../../.github/workflows/api-ci.yml   CI: every command of CLAUDE.md on pull requests and pushes touching services/api
```

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
    queue/                    BullMQ connection, default job options, queue names, JobProcessor, buildJobId; no processor
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
      providers/<vendor>.provider.ts    one file per vendor
      providers/fake.provider.ts        fake used by tests
  modules/                    business domains, one folder each
    orders, checkout, payments, refunds, wallet, finance: four layers
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
- Auth: phone number + OTP, JWT access and refresh tokens.
- HTTP: `@nestjs/swagger` 12, helmet 8, `@nestjs/throttler` 6 with our own Redis storage.

## Routes

- Global prefix: `/v1`.
- Health: `GET /v1/health`. It has no audience segment.
- API documentation: `/docs` and `/docs-json`, outside the prefix.
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
