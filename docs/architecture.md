# Jazlah — Architecture & Code Map

Every task on the board names the exact path it touches. This file defines those paths and the conventions behind them.
Accepted decisions: [ADR-0001 stack](adr/0001-tech-stack.md) · [ADR-0002 monorepo & tooling](adr/0002-monorepo-tooling.md).

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
                    PostgreSQL+PostGIS  Redis   S3-compatible storage
                                     (cache, BullMQ queues, socket adapter)
     Adapters ──► Payment gateway · SMS · Delivery company · ZATCA · FCM · BNPL (post-launch)
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
  prisma/schema.prisma        single Prisma schema; migrations in prisma/migrations
  src/
    main.ts  app.module.ts
    config/                   typed config (zod-validated env)
    common/                   guards (auth, roles), filters, interceptors, i18n errors, pagination, decorators
    database/                 PrismaService, geo helpers (PostGIS raw SQL)
    realtime/                 socket.io gateway + Redis adapter, room conventions
    jobs/                     BullMQ queues and processors
    integrations/
      sms/  payments/  delivery/  zatca/  push/  storage/  bnpl/
        <type>.port.ts        interface (port)
        providers/<name>.ts   implementation (adapter)
    modules/
      auth/ users/ addresses/ coverage/ vendors/ catalog/ pricing/ search/ cart/ coupons/
      scheduling/ checkout/ orders/ payments/ wallet/ refunds/ complaints/ ratings/
      delivery/ notifications/ freshness/ occasions/ visits/ kitchens/ adha/
      feed/ chat/ moderation/ finance/ invoicing/ cms/ admin-users/ audit/ reports/ settings/
        <module>.module.ts
        <module>.service.ts
        controllers/customer.controller.ts | vendor.controller.ts | kitchen.controller.ts | admin.controller.ts
        dto/   events/   <module>.service.spec.ts
  test/                       e2e tests (supertest), one file per module: <module>.e2e-spec.ts
```

**Conventions**
- **Route prefixes by audience:** `/v1/public/*` (no auth), `/v1/customer/*`, `/v1/vendor/*`, `/v1/kitchen/*`, `/v1/admin/*`, `/v1/webhooks/*`.
- **Auth:** JWT access token (15 min) plus a rotating refresh token. Roles are `customer`, `vendor_owner`, `vendor_staff` (post-launch), `kitchen`, `admin` (with permissions), `feed_seller` (a flag on the customer).
- **Money:** stored as integer halalas (`amount_halalas`). VAT is 15%, and prices include VAT unless stated otherwise.
- **Time:** stored in UTC. All business rules (cutoff, capacity, "today") are computed in `Asia/Riyadh` on the server only.
- **Swagger** at `/docs`, spec at `/docs-json`. Every endpoint has DTOs with class-validator and Swagger decorators. The spec is the contract.
- **Errors:** `{ code: "CART_VENDOR_MISMATCH", message: <localized by Accept-Language>, details? }`.
- **Domain events** are emitted in-process (`@nestjs/event-emitter`). Notifications, realtime updates and jobs subscribe to them, never to controllers.
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
