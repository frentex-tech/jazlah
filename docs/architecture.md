# Jazlah — Architecture & Code Map

Every task on the board names the exact path it touches. This file defines those paths and the conventions behind them.
Accepted decisions: [ADR-0001 stack](adr/0001-tech-stack.md) · [ADR-0002 monorepo & tooling](adr/0002-monorepo-tooling.md) · [ADR-0007 backend architecture](adr/0007-backend-architecture.md).

## 1. System overview

```
             ┌──────────────┐   ┌──────────────┐   ┌────────────────────────────┐
             │ Flutter app  │   │ Next.js web  │   │ Next.js dashboard          │
             │ apps/mobile  │   │ apps/web     │   │ apps/dashboard             │
             │ (customer)   │   │ (customer)   │   │ /admin  /vendor  /kitchen  │
             └──────┬───────┘   └──────┬───────┘   └─────────────┬──────────────┘
                    │ HTTPS REST /v1 + WebSocket (socket.io)     │
                    └────────────────────┬───────────────────────┘
                              ┌──────────▼──────────┐
                              │  NestJS API          │  services/api
                              │  modules + jobs      │
                              └──┬──────┬──────┬────┘
                 PostgreSQL 17+PostGIS  Redis   S3-compatible storage
                                     (cache, BullMQ queues, socket adapter)
     Integrations ──► Payment gateway (Geidea) · Mail · SMS · Push (FCM) · Storage · Delivery company · ZATCA · BNPL (post-launch)
```

## 2. Monorepo layout

```
apps/
  mobile/        Flutter customer app
  web/           Next.js customer website
  dashboard/     Next.js admin + vendor + kitchen
services/
  api/           NestJS API
packages/
  api-client/    TypeScript client generated from the API OpenAPI spec (used by web + dashboard)
  config/        shared eslint / tsconfig / prettier presets
infra/
  docker/        docker-compose for local dev (postgres+postgis, redis, minio)
  deploy/        staging / production deployment manifests
design/figma/    Figma Plugin API scripts run through Scripter (idempotent, versioned)
docs/            SRS, requirements index, ADRs, delivery plan
tools/           backlog sync + validator, progress dashboard, dev task helper
.claude/         Claude Code agents, commands and team workflow (internal)
```
JS/TS packages use **pnpm workspaces** with **Turborepo** (`pnpm-workspace.yaml`, `turbo.json` at the root). Flutter lives outside the JS workspace and has its own tooling.

## 3. API (`services/api`)

```
services/api/
  prisma/                     multi-file Prisma schema, one schema file per domain; migrations beside it
  src/
    main.ts  app.module.ts
    config/                   typed config (zod-validated env)
    common/                   guards (auth, roles), filters, interceptors, i18n errors, pagination, decorators
      errors/                 AppError and the error code list
      money/                  the Money helper: all arithmetic on halala amounts
    infra/                    internal infrastructure; never imports from modules/
      database/               PrismaService, geo helpers (PostGIS raw SQL)
      jobs/                   BullMQ queue registration and connection only (no business processors)
      realtime/               socket.io gateway + Redis adapter, room conventions, the publishing port
      event-bus/              in-process event bus (publishers and subscribers live in modules)
      redis/  logger/  health/
    integrations/             external services, one folder per capability
      mail/  sms/  push/  payments/  storage/  delivery/  zatca/  bnpl/
        <capability>.port.ts              interface + injection token (the port)
        <capability>.types.ts             argument and result types of the port
        <capability>.errors.ts            errors the capability raises
        <capability>.service.ts           what the rest of the API calls
        <capability>.module.ts            selects providers from configuration
        index.ts                          public entry; nothing outside the folder imports past it
        providers/<vendor>.provider.ts    one file per vendor (e.g. resend.provider.ts)
        providers/fake.provider.ts        fake used by tests
    modules/
      auth/ users/ addresses/ coverage/ vendors/ catalog/ pricing/ search/ cart/ coupons/
      scheduling/ checkout/ orders/ payments/ wallet/ refunds/ complaints/ ratings/
      delivery/ notifications/ freshness/ occasions/ visits/ kitchens/ adha/
      feed/ chat/ moderation/ finance/ invoicing/ cms/ admin-users/ audit/ reports/ settings/

      orders, checkout, payments, refunds, wallet, finance: four layers
        <module>.module.ts
        api/                  controllers/customer.controller.ts | vendor.controller.ts | kitchen.controller.ts | admin.controller.ts
                              dto/
        application/          one class per use case
        domain/               entities, state machines, rules, ports, events (plain TypeScript)
        infrastructure/       Prisma repositories and mappers

      every other module (promoted to four layers when it gains a state machine or money logic)
        <module>.module.ts
        <module>.service.ts
        controllers/customer.controller.ts | vendor.controller.ts | kitchen.controller.ts | admin.controller.ts
        dto/   events/   <module>.service.spec.ts
  test/                       e2e tests (supertest), one file per module: <module>.e2e-spec.ts
```

The rules for working inside this layout (dependency rules between the folders, enforced by ESLint; one declaration per file; testing and evidence) and the index of shared code are in `services/api/CLAUDE.md` and `services/api/.claude/`.

**Conventions**
- **Database and storage:** PostgreSQL 17 with PostGIS. Object storage is S3-compatible and is reached only through the storage port.
- **Integrations:** every external service sits behind its port, with one provider per vendor. Modules import an integration only through its `index.ts`.
  - `mail`, `sms` and `push` take an ordered provider list and fall back to the next provider on a retryable failure. A vendor error the vendor does not document counts as retryable.
  - `payments` never fails over. One active provider (Geidea) takes new payments, each payment record stores its provider, and capture, void and refund go to that provider. An unknown or ambiguous gateway response marks the payment pending and triggers a status query; it is never retried blindly, because a blind retry can charge the customer twice.
  - `delivery` and `bnpl` work like payments: the provider is recorded on the shipment or transaction, every later call goes to that provider, and there is no automatic failover.
  - `zatca` has no fallback. Submissions go through a queue and retry against the same provider, with an idempotency key so an invoice is never submitted twice.
  - `storage` has one provider and no fallback.
- **Order status** changes in one place only: the state machine in the orders module's domain layer. No other code sets an order's status.
- **Finance ledger:** append-only. Every movement of money (customer payment, commission, merchant payable, refund, COD receivable from the delivery company, transfer) is a ledger entry. Entries are never updated or deleted; a correction is a new entry. Statements and settlements must be reproducible from the entries alone.
- **No inventory module.** Product availability belongs to `catalog` and slot capacity to `scheduling`.
- **Route prefixes by audience:** `/v1/public/*` (no auth), `/v1/customer/*`, `/v1/vendor/*`, `/v1/kitchen/*`, `/v1/admin/*`, `/v1/webhooks/*`.
- **Auth:** JWT access token (15 min) plus a rotating refresh token. Roles are `customer`, `vendor_owner`, `vendor_staff` (post-launch), `kitchen`, `admin` (with permissions), `feed_seller` (a flag on the customer).
- **Money:** stored as integer halalas (`amount_halalas`). VAT is 15%, and prices include VAT unless stated otherwise. All arithmetic on amounts goes through the Money helper in `src/common/money/`. Frontends receive integer halalas through the generated API client; there is no shared money package.
- **Time:** stored in UTC. All business rules (cutoff, capacity, "today") are computed in `Asia/Riyadh` on the server only.
- **Swagger** at `/docs`, spec at `/docs-json`. Every endpoint has DTOs with class-validator and Swagger decorators. The spec is the contract.
- **Errors:** `{ code: "CART_VENDOR_MISMATCH", message: <localized by Accept-Language>, details? }`. `AppError` and the error code list live in `src/common/errors/`. Codes are UPPER_SNAKE_CASE.
- **Domain events** are emitted in-process (`@nestjs/event-emitter`) on the event bus. The bus lives in `src/infra/`; publishers and subscribers both live in modules. Notifications, realtime updates and jobs subscribe to them, never to controllers, so nothing in `infra/` imports from `modules/`.
- **Jobs and realtime:** `src/infra/jobs/` only registers queues and holds the connection; a processor that runs business logic lives inside the module that owns that logic. Modules publish realtime updates through the publishing port in `src/infra/realtime/` and never import the gateway.
- **Audit:** every admin mutation writes to `audit_log` through the `@Audited()` decorator.

## 4. Mobile (`apps/mobile`)

```
apps/mobile/lib/
  main_dev.dart  main_staging.dart  main_prod.dart
  app/            router (go_router), theme (tokens from design system), l10n setup
  core/           api/ (generated dart-dio client in core/api/generated), auth/, storage/, errors/, widgets/
  features/<feature>/
    data/         repositories, DTO mapping
    domain/       models
    presentation/ screens, widgets, controllers (Riverpod)
  l10n/           app_ar.arb  app_en.arb
test/             unit + widget tests mirroring lib/
integration_test/ critical flows
```
Features: `auth, profile, addresses, location, home, store, product, search, cart, checkout, payment, orders, tracking, wallet, complaints, ratings, notifications, occasions, visits, cooking, adha, feed, chat` (plus `loyalty, stories, charity` post-launch).
State management: **Riverpod**. Navigation: **go_router** with deep links `jazlah://`. Push: `firebase_messaging`.

## 5. Customer web (`apps/web`)

```
apps/web/src/
  app/[locale]/(shop)/          home, stores/[slug], products/[slug], search, cart, checkout
  app/[locale]/(account)/       orders, orders/[id], wallet, addresses, profile
  app/[locale]/(services)/      occasions, visits, feed
  components/   lib/api (wraps packages/api-client)   lib/auth
  messages/ar.json  messages/en.json   (next-intl)
```
SSR/ISR for catalog pages (SEO), client components for cart and checkout. Styling: Tailwind with logical properties (`ms-`, `me-`) for RTL.

## 6. Dashboard (`apps/dashboard`)

```
apps/dashboard/src/
  app/[locale]/(auth)/login
  app/[locale]/admin/...     operations, catalog, orders, vendors, finance, marketing, customers, feed, kitchens, occasions, visits, settings, staff
  app/[locale]/vendor/...    orders, products, store, visits, earnings
  app/[locale]/kitchen/...   orders
  features/<feature>/        tables, forms, hooks per feature
  components/ui/             shadcn/ui (RTL-ready)
```
Middleware routes each user by role. The admin sidebar shows only the items the user's permissions allow.

## 7. Contract-first flow between layers

1. The **API task** merges into `develop` with DTOs and Swagger. That makes the contract official.
2. CI regenerates `packages/api-client` (TS) and `apps/mobile/lib/core/api/generated` (Dart) from `/docs-json`, in the same PR or a follow-up `chore(api-client)` PR.
3. **Client tasks** (mobile / web / dashboard) build on the generated client. A client task may start before its API task merges by using a Prism mock of the PR's spec, but it **merges only after** the API task.

Every task's `depends:` field encodes this order.

## 8. Environments

| Env | Source | URL (to be set) | Data |
|---|---|---|---|
| local | any branch | docker-compose | seed data |
| staging | auto-deploy on push to `develop` | `api.staging…`, `staging…`, `admin.staging…` | seed + test vendors |
| production | deploy on tag `vX.Y.Z` from `main` | `api…`, `jazlah…`, `admin…` | real |

- **Mobile builds:** `staging` flavor goes to Firebase App Distribution on every release branch. `prod` flavor goes to TestFlight and Play internal testing when tagged.
