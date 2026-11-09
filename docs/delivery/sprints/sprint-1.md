# Sprint 1 — Foundation, accounts & coverage

> **Goal:** a production-shaped skeleton of the API and the three apps, wired through CI and deployed to staging, plus the design system. On top of it: customers sign in with OTP and manage profile and addresses, staff sign in to the dashboard, and admins draw coverage zones.

**Release:** v0.1.0

**Exit criteria (demo on staging):**
- `GET /v1/public/health/ready` is green on staging; Swagger at `/docs`. Merging to `develop` auto-deploys; a failing test blocks the PR.
- Web, dashboard and the Flutter staging build open, switch AR/EN and render RTL correctly with the design-system components.
- New customer: phone → OTP (fixed code on staging) → profile → add an address on the map, in the app and on the web.
- Admin draws a Riyadh polygon. A point inside shows as covered and a point outside shows the out-of-coverage message.
- Account deletion works and revokes all sessions.

**Merge points:**
- MP-1 (foundation chain, strictly in order): FND-INF-1 → FND-API-1 → FND-API-3 → FND-API-4. FND-INF-3 (CI + client generation) merges right after FND-API-1.
- MP-2: the app scaffolds (APP-MOB-1, APP-WEB-1, APP-DSH-1) merge before any feature task in their app.
- MP-3: ACC-API-1 and LOC-API-1 merge before the account and location client tasks. LOC-MOB-1 (map picker) merges before ACC-MOB-3.
- MP-4: REL-INF-1 → `release/v0.1.0` → `main`.

**Parallel tracks:** Backend: FND-API-*, ACC-API-*, LOC-API-1 · Mobile: APP-MOB-1, ACC-MOB-*, LOC-MOB-1 · Web: APP-WEB-1, ACC-WEB-1, LOC-WEB-1 · Dashboard: APP-DSH-1, ACC-DSH-1, LOC-DSH-1 · DevOps: FND-INF-* · Design: DSN-DES-1, ACC-DES-1

## EPIC FND — Platform foundation
- reqs: NFR-SEC, NFR-SCL, NFR-HST, NFR-OBS
Monorepo tooling, the NestJS core, database, auth core, realtime/queues, storage, settings and audit, CI and environments. Every later epic builds on this.

### FND-INF-1 — Monorepo tooling & local development environment
`type: Task · area: infra · size: M · prio: P0 · reqs: NFR-SCL`

**What:** turn the repo into a working JS/TS monorepo that the API, web, dashboard and shared packages plug into.

This task also covers:
- **Local development environment (docker-compose):** one command that starts every backing service the API needs locally.

**Output:**

*Monorepo tooling (pnpm workspaces + Turborepo + shared config)*
- `package.json` (root, private, `packageManager: pnpm@9`), `pnpm-workspace.yaml` (`apps/web`, `apps/dashboard`, `services/api`, `packages/*`), `turbo.json` with `lint`, `typecheck`, `test`, `build`, `dev` pipelines
- `packages/config` with `eslint` (TS + import order), `tsconfig.base.json`, `prettier` presets
- `.nvmrc` (Node 22 LTS), root scripts `pnpm dev`, `pnpm lint`, `pnpm test`, `pnpm build`

*Local development environment (docker-compose)*
- `infra/docker/docker-compose.yml`: `postgis/postgis:16-3.4`, `redis:7`, `minio` (S3-compatible) + bucket init container
- `services/api/.env.example` with every variable documented
- `infra/docker/README.md` with start/stop/reset commands

**How:**

*Monorepo tooling (pnpm workspaces + Turborepo + shared config)*
- Use Turborepo task caching. Keep `apps/mobile` out of the pnpm workspace (Flutter has its own tooling).
- Add `lint-staged` + `husky` pre-commit (prettier + eslint on staged files) and `commitlint` with the Conventional Commits config from CONTRIBUTING.md.

*Local development environment (docker-compose)*
- Named volumes, healthchecks, fixed ports (5432, 6379, 9000/9001).
- Root script `pnpm infra:up` / `infra:down` / `infra:reset`.

**Where:** `packages/config/`, `infra/docker/`, `services/api/.env.example`

**Acceptance:**
- [ ] `pnpm install && pnpm lint && pnpm build` succeed on a clean clone (with empty app placeholders)
- [ ] A commit message that is not Conventional is rejected locally by commitlint
- [ ] README "How we work" section links the root scripts
- [ ] `pnpm infra:up` brings all services to healthy within 60s
- [ ] `CREATE EXTENSION postgis;` works on the local DB
- [ ] MinIO bucket `jazlah-local` exists after start

### FND-API-1 — NestJS API core + database (Prisma, PostGIS, migrations, seed)
`type: Task · area: api · size: L · prio: P0 · reqs: NFR-SEC, NFR-LNG, NFR-SCL · depends: FND-INF-1`

**What:** the NestJS service with every cross-cutting concern in place, so feature modules only add business logic.

This task also covers:
- **Database: Prisma + PostGIS + migrations + seed:** the persistence layer and the conventions every model follows.

**Output:**

*Scaffold NestJS API core*
- `services/api` NestJS 11 app, `/v1` URI versioning, global prefix
- `config/` typed config validated with zod (fails fast on bad env)
- `common/`: global `ValidationPipe` (whitelist, transform), exception filter returning `{code, message, details}` with messages localized by `Accept-Language` (ar default, en), pagination DTO + helper (`page`, `pageSize`, `total`), `@CurrentUser()` decorator stub
- Swagger at `/docs` and `/docs-json` with bearer auth scheme and tags per audience (`public`, `customer`, `vendor`, `kitchen`, `admin`, `webhooks`)
- `GET /v1/public/health` (liveness) and `/v1/public/health/ready` (DB, Redis, storage checks via `@nestjs/terminus`)
- `helmet`, CORS allow-list from env, `pino` structured logging with request id, graceful shutdown

*Database: Prisma + PostGIS + migrations + seed*
- `services/api/prisma/schema.prisma` with base conventions: `id` (cuid2 string), `createdAt`, `updatedAt`, `deletedAt?` for soft-deletable models
- First migration enabling `postgis`, `pg_trgm` and `unaccent`
- `database/prisma.service.ts`, `database/geo.ts` (helpers: `pointFromLatLng`, `isPointInPolygon`, `toGeoJSON`) using `$queryRaw`
- `prisma/seed.ts` (idempotent) and the scripts `db:migrate`, `db:seed`, `db:reset`, `db:studio`

**How:**

*Scaffold NestJS API core*
- Folder layout exactly as in `docs/architecture.md §3`.
- Error codes live in `common/errors/codes.ts`. Translations live in `common/i18n/{ar,en}.json`.
- Jest config for unit tests, `test/` for e2e with supertest. Add one sample e2e test for health.

*Database: Prisma + PostGIS + migrations + seed*
- PostGIS columns are declared as `Unsupported("geometry(Point,4326)")` / `Unsupported("geometry(Polygon,4326)")`. All geo reads and writes go through `geo.ts`.
- Money is stored as `Int` halalas. Document this at the top of the schema.
- Migrations are committed. CI runs `prisma migrate deploy` against a fresh DB.

**Where:** `services/api/src/{main.ts,app.module.ts,config,common}`, `services/api/test/`, `services/api/prisma/`, `services/api/src/database/`

**Acceptance:**
- [ ] `pnpm --filter api dev` serves Swagger and health
- [ ] An invalid DTO returns 400 with `code: VALIDATION_FAILED` and an Arabic message by default, English with `Accept-Language: en`
- [ ] Unit and e2e test commands pass in CI
- [ ] `db:reset` creates the schema and seeds without errors
- [ ] A unit test proves `isPointInPolygon` returns true/false for a sample Riyadh polygon
- [ ] CI e2e job uses a Postgres+PostGIS service container

### FND-API-3 — Auth core: JWT, refresh rotation, roles & permissions
`type: Task · area: api · size: M · prio: P0 · reqs: NFR-SEC · depends: FND-API-1 · labels: security`

**What:** token issuing and authorization guards, used by every audience. OTP login comes in ACC-API-1.

**Output:**
- Models: `User` (phone E.164 unique, name, email?, locale, status active|blocked|deleted), `UserRole` (customer, vendor_owner, kitchen, admin), `RefreshToken` (hashed, family id, expiresAt, revokedAt, device info)
- `AuthService.issueTokens(user)`: access JWT 15 min (`sub`, `roles`, `vendorId?`, `kitchenId?`, `perms?`) + refresh 30 days with **rotation and reuse detection** (reuse revokes the family)
- `POST /v1/public/auth/refresh`, `POST /v1/customer/auth/logout` (also for other audiences)
- Guards: `JwtAuthGuard`, `RolesGuard` with `@Roles()`, `PermissionsGuard` with `@Permissions()` (permissions filled in ADM-API-1), audience guard per route prefix
- CLI seed command `pnpm --filter api create-admin --phone +9665XXXXXXXX --name "..."` that creates a super-admin with all permissions

**How:**
- `@nestjs/jwt` + passport-jwt. Secrets come from config, separate for access and refresh.
- Refresh tokens are stored as SHA-256 hashes, never raw.

**Where:** `services/api/src/modules/auth/`, `services/api/src/common/guards/`, `services/api/src/cli/`

**Acceptance:**
- [ ] e2e: a reused refresh token returns 401 and revokes the whole family
- [ ] e2e: a customer token gets 403 on any `/v1/admin/*` route
- [ ] Super-admin created by the CLI command can obtain tokens (via test helper)

### FND-API-4 — Async backbone, file storage, settings store & audit log
`type: Task · area: api · size: L · prio: P0 · reqs: NFR-SCL, FR-ADM-12 · depends: FND-API-3, FND-API-1`

**What:** the async backbone, covering jobs, events and live updates to dashboards and chat.

This task also covers:
- **File storage service (S3-compatible):** a single way to upload and serve images, videos and documents (product images, vendor documents, freshness videos, complaint photos, chat images).
- **Settings store & audit log:** typed platform settings (used by operations, payments, occasions, Adha…) and an audit trail of sensitive actions.

**Output:**

*Redis, BullMQ queues, domain events, realtime gateway*
- `RedisModule` (ioredis) with a cache helper (`getOrSet`, `invalidate(prefix)`)
- `jobs/` BullMQ setup, a sample queue, Bull Board UI at `/admin/queues` (admin only, disabled in prod unless flagged)
- `@nestjs/event-emitter` registered, with the event naming convention `domain.entity.action` (e.g. `order.status.changed`)
- `realtime/realtime.gateway.ts`: socket.io with JWT auth on handshake, Redis adapter, rooms `user:{id}`, `vendor:{id}`, `kitchen:{id}`, `admin:orders`, `chat:{conversationId}`; `RealtimeService.emitTo(room, event, payload)`

*File storage service (S3-compatible)*
- `integrations/storage/storage.port.ts` + `providers/s3.ts` (works with MinIO locally and the cloud provider in staging/prod)
- `POST /v1/{customer|vendor|admin|kitchen}/uploads` → returns a presigned PUT URL + `mediaId`; `Media` model (owner, purpose, mime, size, key, status pending|ready)
- Server-side rules per `purpose`: allowed MIME types, max size (image 5 MB, video 30 MB / 30 s, document 10 MB), private vs public bucket
- Image variants (thumb 200, medium 800) generated by a BullMQ job with `sharp`

*Settings store & audit log*
- `Setting` model (key, JSON value, updatedBy, updatedAt), `SettingsService.get<T>(key)` with zod schema per key, Redis-cached, invalidated on write
- `AuditLog` model (actorId, action, entity, entityId, before, after, ip, at); `@Audited('entity.action')` decorator for admin controllers
- Seed defaults for every known key (filled in by later tasks that own the keys)

**How:**

*Redis, BullMQ queues, domain events, realtime gateway*
- Gateway namespace `/rt`. Events are typed in `realtime/events.ts`, and clients mirror these names.
- Failed jobs retry 5× with exponential backoff and then move to a dead-letter queue.

*File storage service (S3-compatible)*
- Private documents (CR, health certificate, IBAN proof) are only served through short-lived signed GET URLs, and only to the owner and admins.

*Settings store & audit log*
- Each module registers its setting keys and schemas in `settings/registry.ts`, so unknown keys can't be written.

**Where:** `services/api/src/{realtime,jobs}/`, `services/api/src/common/cache/`, `services/api/src/integrations/storage/`, `services/api/src/modules/media/`, `services/api/src/modules/{settings,audit}/`

**Acceptance:**
- [ ] e2e: a client with a valid token joins its `user:{id}` room and receives a test event
- [ ] A connection without a token is rejected
- [ ] A failing sample job retries and lands in the DLQ
- [ ] Upload flow works end-to-end against MinIO
- [ ] Wrong MIME type or oversize is rejected with a clear error code
- [ ] Private documents are not reachable without a signed URL
- [ ] Writing a setting with an invalid shape returns 400
- [ ] An admin mutation decorated with `@Audited` creates an audit row with before/after

### FND-INF-3 — CI pipeline & API client generation (TypeScript + Dart)
`type: Task · area: infra · size: M · prio: P0 · depends: FND-API-1`

**What:** GitHub Actions that keep `develop` healthy.

This task also covers:
- **API client generation (TypeScript + Dart):** clients are generated from the API contract so nobody hand-writes HTTP calls.

**Output:**

*CI pipeline for the API and shared packages*
- `.github/workflows/ci-api.yml` (path filter `services/api/**`, `packages/**`): install with pnpm cache → lint → typecheck → unit tests → e2e with Postgres+PostGIS and Redis service containers → build
- Required job names documented in CONTRIBUTING.md

*API client generation (TypeScript + Dart)*
- `packages/api-client`: `openapi-typescript` types + `openapi-fetch` client factory (`createApiClient({baseUrl, getToken, locale})`)
- `scripts/gen-api-client.sh`: boots the API in spec-only mode (or reads `services/api/openapi.json`) → regenerates TS and Dart (`openapi-generator dart-dio` into `apps/mobile/lib/core/api/generated`)
- API build writes `services/api/openapi.json`, which is committed so diffs are reviewable
- CI check: spec changed but clients not regenerated → fail

**How:**

*CI pipeline for the API and shared packages*
- Turborepo `--filter=...[origin/develop]` so only affected packages run. Concurrency group cancels superseded runs.
- Each app adds its own workflow in its scaffold task (APP-*).

**Where:** `.github/workflows/`, `packages/api-client/`, `scripts/`, `services/api/openapi.json`

**Acceptance:**
- [ ] A PR touching only `apps/web` does not run the API job
- [ ] A failing unit test marks the PR check red
- [ ] Changing a DTO and running the script updates both generated clients
- [ ] The CI drift check fails when `openapi.json` is stale

### FND-INF-4 — Spike: Saudi-region hosting (ADR-0003) & third-party accounts
`type: Task · area: infra · size: S · prio: P0 · reqs: NFR-HST, NFR-AVL · labels: spike, needs-client`

**What:** pick where staging and production run, with cost estimates, for the client to approve.

This task also covers:
- **Third-party accounts checklist (owned by client):** every external account the platform needs, created under the client's ownership with Frentex added as admin/developer.

**Output:**

*Spike: Saudi-region hosting choice (ADR-0003)*
- `docs/adr/0003-hosting.md` comparing at least 3 options with a Saudi region (e.g. Google Cloud Dammam, Oracle Jeddah/Riyadh, a local provider such as STC Cloud): managed Postgres with PostGIS, managed Redis, object storage, container runtime, backups/PITR, monthly cost for staging and prod, data residency

*Third-party accounts checklist (owned by client)*
- `docs/accounts.md` (no secrets) listing account, owner, who has access, status: Apple Developer (organization), Google Play Console, Firebase project (dev/staging/prod apps), Google Maps Platform (billing + restricted keys), domain & DNS, email sender, SMS provider, payment gateway, delivery company, ZATCA portal, hosting provider

**How:**

*Spike: Saudi-region hosting choice (ADR-0003)*
- check each candidate for managed PostGIS support and PITR. Include a recommendation.

*Third-party accounts checklist (owned by client)*
- share the list with the client as a single request.

**Where:** `docs/adr/`, `docs/accounts.md`

**Acceptance:**
- [ ] ADR merged with status `accepted` after client approval of the cost
- [ ] Chosen provider accounts created **under the client's ownership**, with Frentex access
- [ ] Every row has an owner and a status
- [ ] Firebase and Google Maps keys are ready before the location and push tasks start

### FND-INF-5 — Staging environment & auto-deploy from develop
`type: Task · area: infra · size: L · prio: P0 · reqs: NFR-HST, NFR-SEC · depends: FND-INF-4, FND-API-1, FND-INF-3`

**What:** a staging environment that always runs the latest `develop`.

**Output:**
- Dockerfiles for `services/api`, `apps/web` and `apps/dashboard` (multi-stage, non-root)
- Staging: managed Postgres+PostGIS, Redis, object storage bucket(s), API + web + dashboard services, HTTPS on `api.staging.<domain>`, `staging.<domain>`, `admin.staging.<domain>`
- `.github/workflows/deploy-staging.yml` on push to `develop` (per app, path filtered), running `prisma migrate deploy` before the API rollout
- Secrets in GitHub Environments (`staging`) and the provider's secret manager. Nothing in the repo.
- `infra/deploy/README.md`: how to deploy, roll back, read logs

**How:** keep manifests in `infra/deploy/staging/`. Production mirrors this later (HRD-INF-1).

**Where:** `infra/deploy/`, `services/api/Dockerfile`, `apps/web/Dockerfile`, `apps/dashboard/Dockerfile`, `.github/workflows/deploy-staging.yml`

**Acceptance:**
- [ ] A merge to `develop` is live on staging within 15 minutes, without manual steps
- [ ] `/v1/public/health/ready` on staging is green
- [ ] Rollback to the previous image is documented and tested once

## EPIC APP — Client app scaffolds
- reqs: NFR-LNG, NFR-CMP, NFR-USB
Empty but production-shaped Flutter app, customer website and dashboard, each with i18n/RTL, the API client, auth plumbing and CI.

### APP-MOB-1 — Scaffold Flutter customer app + design-system widgets
`type: Task · area: mobile · size: XL · prio: P0 · reqs: NFR-LNG, NFR-CMP · depends: FND-INF-3`

**What:** the Flutter project every mobile feature plugs into.

This task also covers:
- **Implement design system in Flutter:** Flutter theme and base widgets from the tokens.

**Output:**

*Scaffold Flutter customer app*
- `apps/mobile` Flutter (stable) app, bundle ids `sa.jazlah.app` (+ `.dev`, `.staging`), flavors dev/staging/prod with `main_<flavor>.dart` and per-flavor Firebase config
- Structure from `docs/architecture.md §4`: `app/`, `core/`, `features/`, `l10n/`
- Riverpod, go_router with deep-link scheme `jazlah://` and universal links placeholder, `flutter_localizations` + ARB files (ar default, en), RTL by locale
- `core/api`: generated dart-dio client wired with an interceptor that adds the token and `Accept-Language` and refreshes on 401 (single-flight)
- `core/storage`: `flutter_secure_storage` for tokens, `shared_preferences` for prefs
- `.github/workflows/ci-mobile.yml`: `flutter analyze`, `flutter test`, build Android debug (path filter `apps/mobile/**`)

*Implement design system in Flutter*
- `app/theme/` (ThemeData from `tokens.json`, text styles AR/EN), `core/widgets/` (JButton, JTextField, JPhoneField, JOtpField, JChip, JProductCard, JBottomSheet, JDialog, JToast, JEmptyState, JStatusTimeline), a debug-only widget gallery screen

**How:**

*Scaffold Flutter customer app*
- Min iOS 14, min Android SDK 26. Lints: `very_good_analysis` or `flutter_lints` strict.
- An example feature `features/_example` shows the data/domain/presentation pattern. Delete it once the first real feature lands.
- Firebase projects (dev/staging) can be created by the team and moved to the client's ownership later.
- Until DSN-DES-1 lands, use provisional tokens in `docs/design/tokens.json`. Swapping them for the final tokens must need no widget changes.

**Where:** `apps/mobile/`, `apps/mobile/lib/app/theme/`, `apps/mobile/lib/core/widgets/`

**Acceptance:**
- [ ] The staging flavor runs on an iOS simulator and an Android emulator
- [ ] Switching device language flips layout direction
- [ ] CI mobile job is green
- [ ] The gallery renders every widget in AR and EN
- [ ] Widget tests for the button and OTP field

### APP-WEB-1 — Scaffold customer website + shared Tailwind design system
`type: Task · area: web · size: L · prio: P0 · reqs: NFR-LNG, NFR-CMP · depends: FND-INF-3, APP-DSH-1`

**What:** the customer website shell.

This task also covers:
- **Implement design system for web and dashboard (Tailwind preset):** shared Tailwind preset and base components for both Next.js apps.

**Output:**

*Scaffold Next.js customer website*
- `apps/web` Next.js 15 (App Router, TypeScript), `next-intl` with `/ar` (default) and `/en`, `<html dir>` per locale
- Tailwind with logical-property usage, layout (header with logo, location slot, cart slot, account slot; footer), error/404 pages localized
- `lib/api` wrapping `packages/api-client` for server and client components
- `lib/auth`: session approach. The refresh token goes in an httpOnly cookie set by a Next route handler (`/api/session`). The access token stays in memory.
- `.github/workflows/ci-web.yml`: lint, typecheck, build, Playwright smoke (home renders in ar and en)

*Implement design system for web and dashboard (Tailwind preset)*
- `packages/config/tailwind-preset.ts` from `tokens.json`, fonts loaded via `next/font`, web base components (`apps/web/src/components/ui`), shadcn theme variables for the dashboard

**How:**
- Start on provisional tokens. The Tailwind preset reads `docs/design/tokens.json`, so the final brand tokens drop in without component changes.

**Where:** `apps/web/`, `packages/config/`, `apps/web/src/components/ui/`, `apps/dashboard/src/components/ui/`

**Acceptance:**
- [ ] `/ar` renders RTL, `/en` renders LTR, and the locale switch keeps the current path
- [ ] CI web job is green
- [ ] Both apps use the same colors and fonts from the preset
- [ ] RTL spacing uses logical utilities only (lint rule or review checklist)

### APP-DSH-1 — Scaffold dashboard (admin / vendor / kitchen shells)
`type: Task · area: dashboard · size: M · prio: P0 · reqs: NFR-LNG · depends: FND-INF-3, FND-API-3`

**What:** one Next.js app hosting the three role-based dashboards.

**Output:**
- `apps/dashboard` Next.js 15 + next-intl (ar default, en) + shadcn/ui (RTL-configured) + TanStack Table + react-hook-form + zod
- Route groups `/admin`, `/vendor`, `/kitchen`, each with its own layout and sidebar. Middleware redirects by role from the session; unauthenticated users go to `/login` (UI only, wired in ACC-DSH-1)
- Shared primitives in `components/ui`: DataTable (server pagination, filters, column visibility), FormField wrappers, ConfirmDialog, Status badges, Empty/Loading/Error states, file upload component using presigned URLs
- `.github/workflows/ci-dashboard.yml`: lint, typecheck, build, Playwright smoke

**Where:** `apps/dashboard/`

**Acceptance:**
- [ ] Visiting `/admin` without a session redirects to `/login`
- [ ] DataTable demo page paginates against a mocked endpoint
- [ ] CI dashboard job is green

## EPIC DSN — Design system & UX foundations
- reqs: NFR-USB, NFR-LNG
Brand assets, information architecture, tokens and core components shared by all apps.

### DSN-DES-1 — Brand assets, information architecture & design system
`type: Task · area: design · size: XL · prio: P0 · reqs: NFR-USB, NFR-LNG · labels: needs-client`

**What:** turn the identity the client already approved (burgundy & gold, Readex Pro + El Messiri, see `docs/design/README.md` and the approved prototype https://frentex-tech.github.io/sinam-brand/app/v2/) into Jazlah's production assets and Figma design system. Only the name changed (Sinam → Jazlah), so the wordmark is redrawn and the palette is kept.

This task also covers:
- **Information architecture & key user flows:** sitemap and flows before screens are drawn.
- **Design tokens & component library (mobile + web + dashboard):** the reusable UI kit every screen is built from.

**Output:**

*Jazlah brand assets (logo, colors, app icon, splash)*
- «جزلة / Jazlah» wordmark in AR/EN lockups (SVG) in the style of the approved emblem, the emblem decision confirmed with the client (keep the ram shield or adapt it), app icon (iOS/Android adaptive), splash, favicon set, exported to `docs/design/brand/`
- Figma file «Jazlah — Product Design» with variables seeded from `docs/design/tokens.json` (the approved palette)

*Information architecture & key user flows*
- customer app map (tabs: Home, Services (occasions/visits/feed), Orders, Account), dashboard sitemaps per role, flow diagrams for order (≤ 6 steps, NFR-USB), occasion request, farm visit, cooking, Adha, feed listing and chat

*Design tokens & component library (mobile + web + dashboard)*
- tokens (color, typography AR + EN font pairing, spacing, radius, elevation), components with states (buttons, inputs, phone input, OTP field, chips, selectors, steppers, cards, product card, bottom sheet, dialog, toast, tabs, empty/error states, map pin, status timeline), dashboard components (table, filters, form layout, side nav), RTL/LTR rules, contrast checked (WCAG AA)

**How:**

*Jazlah brand assets (logo, colors, app icon, splash)*
- The palette and fonts are already approved, so don't re-open them. Get written client approval on the new wordmark only.
- Use the approved prototype's screens (`docs/design/reference/screens/`) as the visual reference for components.

**Where:** `docs/design/brand/`, `docs/design/flows/`, `docs/design/tokens.json`

**Acceptance:**
- [ ] Client approved the Jazlah wordmark in writing (palette and fonts already approved)
- [ ] Assets exported at all required sizes
- [ ] The regular order flow reaches "order placed" in ≤ 6 steps
- [ ] Both developers reviewed the flows
- [ ] `tokens.json` exported and committed
- [ ] Every component has RTL and LTR variants

## EPIC ACC — Accounts & authentication
- reqs: FR-ACC-01, FR-ACC-02, FR-ACC-03, FR-ACC-04, FR-ACC-05
Phone + OTP sign-in for customers and staff, profile, language, addresses and account deletion.

### ACC-DES-1 — Screens: onboarding, OTP, profile, addresses, location, settings
`type: Task · area: design · size: M · prio: P0 · reqs: FR-ACC-01, FR-ACC-02, FR-ACC-03, FR-ACC-04, FR-ACC-05, FR-LOC-01, FR-LOC-02 · depends: DSN-DES-1`

**What:** high-fidelity screens for this sprint, mobile and web.

**Output:** onboarding (3 slides), phone entry, OTP (resend timer, error states), complete profile, settings (language, logout, delete account with confirmation), address list / add on map / edit, location permission prompt, out-of-coverage state, dashboard login

**Where:** Figma (link in the issue)

**Acceptance:**
- [ ] Every screen has AR and EN, empty, loading and error states
- [ ] Developers signed off in the issue comments

### ACC-API-1 — OTP authentication (customers & staff) with SMS port
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-ACC-01, NFR-SEC · depends: FND-API-3, FND-API-4 · labels: security, needs-client`

**What:** passwordless sign-in by phone for every audience.

**Output:**
- `POST /v1/public/auth/otp/request` `{phone, audience: customer|staff}` → `{expiresIn, resendIn}`
- `POST /v1/public/auth/otp/verify` `{phone, code, audience, deviceId}` → `{accessToken, refreshToken, user, isNew}`
- `OtpCode` model (phone, codeHash, attempts, expiresAt, consumedAt)
- `integrations/sms/sms.port.ts` with providers `log` (dev), `fixed` (staging: code `123456` for allow-listed test numbers) and the production provider once chosen

**How:**
- Code: 6 digits, 5 min expiry, max 5 verify attempts, resend after 60 s.
- Rate limits (Redis): 5 requests per phone per hour and 20 per IP per hour → `OTP_RATE_LIMITED`.
- Normalize phones to E.164 and accept Saudi mobile numbers only (`+9665XXXXXXXX`) for customers.
- `audience=customer` creates the user on first verify (role `customer`). `audience=staff` only works if the phone already has an admin, vendor_owner or kitchen role, so no self-signup.
- Store only the hash of the code. Never log the code outside the `log` provider.
- The SMS text is localized and includes the app hash for Android autofill.

**Where:** `services/api/src/modules/auth/`, `services/api/src/integrations/sms/`

**Acceptance:**
- [ ] e2e: request → verify returns tokens; a wrong code 5× locks the code
- [ ] e2e: staff audience with an unknown phone returns `STAFF_NOT_FOUND` without leaking whether it exists as a customer
- [ ] Rate limit returns 429 with `OTP_RATE_LIMITED`
- [ ] Switching the SMS provider is a config change only

### ACC-API-2 — Profile, devices, addresses & account deletion
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-ACC-02, FR-ACC-04, FR-ACC-03, FR-LOC-03, FR-ACC-05, NFR-PRV · depends: ACC-API-1, LOC-API-1`

**What:** read and update the customer profile, and register devices for push.

This task also covers:
- **Addresses with geo point and lock rule:** saved addresses that checkout and delivery rely on.
- **Account deletion (PDPL / store compliance):** customers can delete their account from inside the app.

**Output:**

*Customer profile & device registration*
- `GET /v1/customer/me`, `PATCH /v1/customer/me` `{name, email?, locale: ar|en}`, `POST /v1/customer/devices` `{fcmToken, platform, appVersion}`, `DELETE /v1/customer/devices/:token`; `Device` model

*Addresses with geo point and lock rule*
- `Address` model (userId, label home|work|other + customLabel, point, city, district, street, building, notesForDriver, isDefault); `GET/POST/PATCH/DELETE /v1/customer/addresses`; each address returned with `isCovered` and `isLocked`

*Account deletion (PDPL / store compliance)*
- `DELETE /v1/customer/me` with reason → anonymizes PII (name, email, phone → hashed tombstone), deletes addresses and devices, revokes all refresh tokens, sets status `deleted`
- `UserConsent` (userId, policy terms|privacy|marketing, version, acceptedAt, ip) and `POST /v1/customer/consents`. Terms + privacy acceptance is required at signup (PDPL). Marketing is **opt-in** and defaults to off

**How:**

*Customer profile & device registration*
- validate email format and lowercase it. `locale` drives notification language later.

*Addresses with geo point and lock rule*
- Only one default per user, enforced in a transaction.
- `isLocked` comes from an `AddressUsagePort` (interface in `addresses/`). It returns `false` until ORD-API-1 provides the real implementation (an address used by a non-final order). PATCH and DELETE on a locked address return `ADDRESS_IN_USE`.
- `isCovered` uses `CoverageService.isCovered(point)` from LOC-API-1.

*Account deletion (PDPL / store compliance)*
- blocked with `ACCOUNT_HAS_ACTIVE_ORDERS` while orders are not final (port, wired in ORD-API-1). Orders and invoices are kept for tax retention but no longer linked to identifiable data.

**Where:** `services/api/src/modules/users/`, `services/api/src/modules/addresses/`

**Acceptance:**
- [ ] e2e for update and device upsert (same token is not duplicated)
- [ ] e2e: setting a new default unsets the old one
- [ ] Unit test: locked address cannot be edited (port mocked to true)
- [ ] e2e: after deletion the old refresh token fails and the phone can register as a brand-new user

### ACC-MOB-1 — Mobile: onboarding, OTP sign-in, profile & settings
`type: Feature · area: mobile · size: L · prio: P0 · reqs: FR-ACC-01, FR-ACC-02, FR-ACC-04, FR-ACC-05 · depends: ACC-API-1, ACC-DES-1, APP-MOB-1, ACC-API-2`

**What:** first-run experience and login.

This task also covers:
- **Mobile: profile, language switch, logout, delete account:** account settings.

**Output:**

*Mobile: onboarding & OTP sign-in*
- `features/auth`: onboarding (shown once), phone screen (+966 mask, validation), OTP screen (6-box field, 60 s resend, Android SMS autofill via `sms_autofill`, iOS one-time-code content type), guest mode (browse without login; login required at checkout), token persistence and auto-login on app start

*Mobile: profile, language switch, logout, delete account*
- `features/profile`: complete/edit profile, language switch at runtime (persists, sends `locale` to API, flips direction without restart), logout, delete account with two-step confirmation and reason

**How:**

*Mobile: onboarding & OTP sign-in*
- store tokens via `core/auth` (secure storage). After first login with `isNew=true`, go to complete-profile.

**Where:** `apps/mobile/lib/features/auth/`, `apps/mobile/lib/features/profile/`

**Acceptance:**
- [ ] Widget tests: invalid phone disables continue; resend enables after 60 s
- [ ] Killing and reopening the app keeps the session
- [ ] Switching to English updates every visible string and direction immediately
- [ ] Deleting the account returns to onboarding and clears secure storage

### ACC-MOB-3 — Mobile: address management
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-ACC-03 · depends: ACC-API-2, LOC-MOB-1`

**What:** list, add, edit and delete addresses.

**Output:** `features/addresses`: list with default badge, coverage tag and lock icon; add/edit using the map picker from LOC-MOB-1 (drag pin, reverse-geocode to fill district/street), labels, driver notes, set default

**Where:** `apps/mobile/lib/features/addresses/`

**Acceptance:**
- [ ] Locked addresses show a disabled edit/delete with an explanation
- [ ] Out-of-coverage addresses can be saved but are flagged

### ACC-WEB-1 — Web: OTP sign-in, profile, language & addresses
`type: Feature · area: web · size: L · prio: P0 · reqs: FR-ACC-01, FR-ACC-02, FR-ACC-04, FR-ACC-05, FR-ACC-03 · depends: ACC-API-1, ACC-API-2, APP-WEB-1, LOC-WEB-1`

**What:** customer login and account pages on the website.

This task also covers:
- **Web: address management:** addresses page on the website.

**Output:**

*Web: OTP sign-in, profile & language*
- login modal/page (phone → OTP), `/[locale]/profile` (edit, delete account), session via `/api/session` route handler (httpOnly refresh cookie, in-memory access token, silent refresh), locale switch in header

*Web: address management*
- `/[locale]/addresses` with a map picker (Google Maps JS), list, default, lock and coverage indicators

**Where:** `apps/web/src/app/[locale]/(account)/profile`, `apps/web/src/lib/auth/`, `apps/web/src/app/[locale]/(account)/addresses`

**Acceptance:**
- [ ] Refreshing the page keeps the user signed in
- [ ] Playwright: login with the staging fixed code
- [ ] Add/edit/delete work and respect the lock rule

### ACC-DSH-1 — Dashboard: staff OTP login & role routing
`type: Feature · area: dashboard · size: S · prio: P0 · reqs: FR-ACC-01 · depends: ACC-API-1, APP-DSH-1`

**What:** admins, vendors and kitchen users sign in to the dashboard.

**Output:** `/[locale]/login` (phone → OTP with `audience=staff`), session cookie handling, redirect to `/admin`, `/vendor` or `/kitchen` by role (picker if the user has several), logout, idle timeout of 12 h

**Where:** `apps/dashboard/src/app/[locale]/(auth)/login`, `apps/dashboard/src/middleware.ts`

**Acceptance:**
- [ ] The super-admin from the CLI seed logs in on staging
- [ ] A customer-only phone gets a clear "no dashboard access" message, **except** on `/vendor/apply` and `/vendor/application`, which accept customer sessions

## EPIC LOC — Location & coverage zones
- reqs: FR-LOC-01, FR-LOC-02, FR-LOC-03
Coverage polygons managed by the admin, location detection in the apps, and server-side coverage checks.

### LOC-API-1 — Coverage zones (PostGIS) & coverage check
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-LOC-02, FR-LOC-03 · depends: FND-API-1, FND-API-4`

**What:** store service areas as polygons and answer "is this point covered?".

**Output:**
- `CoverageZone` model (nameAr, nameEn, city, polygon geometry(Polygon,4326) with GIST index, isActive)
- Admin: `GET/POST/PATCH/DELETE /v1/admin/coverage-zones` (GeoJSON in/out), audited
- Public: `GET /v1/public/coverage/check?lat=&lng=` → `{covered, zone?: {id, name, city}}`
- `CoverageService.isCovered(point)` and `findZone(point)` exported for addresses, checkout and kitchen assignment

**How:** reject invalid polygons (`ST_IsValid`) and self-intersections. Cache the active zones list in Redis and invalidate it on change. Seed one sample Riyadh zone.

**Where:** `services/api/src/modules/coverage/`

**Acceptance:**
- [ ] e2e: point inside → covered, outside → not covered, inactive zone ignored
- [ ] Invalid polygon returns `INVALID_POLYGON`

### LOC-DSH-1 — Dashboard: coverage zones map editor
`type: Feature · area: dashboard · size: L · prio: P0 · reqs: FR-LOC-02, FR-ADM-05 · depends: LOC-API-1, ACC-DSH-1`

**What:** admins draw and manage delivery coverage on a map.

**Output:** `/admin/settings/coverage`: map (Google Maps with the Drawing library or Terra Draw), draw/edit/delete polygons, zone list with names AR/EN, city, active toggle, color per zone, a "test a point" tool

**Where:** `apps/dashboard/src/app/[locale]/admin/settings/coverage`, `apps/dashboard/src/features/coverage/`

**Acceptance:**
- [ ] Drawing and saving a polygon persists it and it renders on reload
- [ ] The test-point tool matches the API result

### LOC-MOB-1 — Mobile: location bootstrap, map picker & out-of-coverage state
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-LOC-01, FR-LOC-02 · depends: LOC-API-1, APP-MOB-1`

**What:** the app knows the customer's location from the first screen.

**Output:** `features/location`: permission flow (explain before the OS prompt), current location via `geolocator`, choose from saved addresses or the map, a reusable `MapPicker` widget (google_maps_flutter, center pin, reverse geocode), persisted selected location provider, an out-of-coverage banner that still allows browsing and pickup

**Where:** `apps/mobile/lib/features/location/`, `apps/mobile/lib/core/widgets/map_picker.dart`

**Acceptance:**
- [ ] Denying permission falls back to manual selection without a dead end
- [ ] Out-of-coverage locations show the banner and the pickup suggestion

### LOC-WEB-1 — Web: location selector & coverage notice
`type: Feature · area: web · size: S · prio: P0 · reqs: FR-LOC-01, FR-LOC-02 · depends: LOC-API-1, APP-WEB-1`

**What:** location selection in the website header.

**Output:** header location chip → modal (browser geolocation, map, saved addresses if logged in), coverage notice banner, selection stored in a cookie for SSR

**Where:** `apps/web/src/components/location/`

**Acceptance:**
- [ ] The selection persists across pages and reloads

## EPIC INV — ZATCA e-invoicing
- reqs: FR-PAY-05
The tax and invoicing decisions that shape the order, VAT and finance data model. Implementation is in Sprint 6.

### INV-DOC-1 — Spike: ZATCA Phase 2 approach & seller of record (ADR-0006)
`type: Task · area: docs · size: S · prio: P0 · reqs: FR-PAY-05 · labels: spike, needs-client`

**What:** decide how to integrate with ZATCA, and who issues invoices for partner orders.

**Output:** `docs/adr/0006-zatca-einvoicing.md`: direct integration vs a certified e-invoicing provider (cost, effort, maintenance); onboarding steps (CSR → compliance CSID → compliance checks → production CSID) under the client's VAT number; simplified (B2C) invoice reporting within 24 h; **seller of record for partner-vendor orders** (Jazlah sells and settles with vendors vs vendor-issued invoices) **confirmed with the client's accountant**

**Where:** `docs/adr/`

**How:** decide **before Sprint 3**. The answer fixes the order VAT fields, whether `Vendor.vatNumber` is mandatory, the commission/VAT treatment in FIN-API-1, and whether advance payments (occasion deposits, animal deposits, visit fees) are invoiced on receipt.

**Acceptance:**
- [ ] ADR accepted with the client's written confirmation on the seller-of-record question

## EPIC REL — Releases & merge points
Sprint-end merge points. Each task cuts a release branch, verifies the sprint's exit criteria on staging, merges to `main`, tags, back-merges to `develop` and updates STATUS.md.

### REL-INF-1 — Release v0.1.0 (Sprint 1 merge point)
`type: Task · area: infra · size: XS · prio: P0 · depends: FND-INF-5, APP-MOB-1, APP-WEB-1, APP-DSH-1, ACC-MOB-1, ACC-MOB-3, ACC-WEB-1, ACC-DSH-1, LOC-DSH-1, LOC-WEB-1`

**What:** close Sprint 1 with the first tagged release.

**Output:** `release/v0.1.0` → `main` (merge commit), tag `v0.1.0`, back-merge `main` → `develop`, staging build of the mobile app on Firebase App Distribution, STATUS.md updated

**How:** follow CONTRIBUTING.md §6. Run every exit criterion of this sprint file on staging and tick them in the release PR description.

**Where:** git, `docs/delivery/STATUS.md`

**Acceptance:**
- [ ] Exit criteria demoed and ticked in the release PR
- [ ] All sprint P0 issues closed, or explicitly moved with a reason in STATUS.md
- [ ] Tag `v0.1.0` exists and `develop` is back-merged

