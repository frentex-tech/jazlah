# ADR-0002: Monorepo, tooling and core libraries

- **Status:** accepted
- **Date:** 2026-11-09

## Context
Two developers will build four apps against one API. We need one place for code, issues and releases, and libraries that won't need replacing later.

## Decision
| Concern | Choice | Why |
|---|---|---|
| Repo | Single monorepo `frentex-tech/jazlah` | One board, one PR flow, atomic API and client changes |
| JS workspace | pnpm + Turborepo | Fast installs, cached builds per app |
| ORM | Prisma | Typed schema and migrations. PostGIS columns use `Unsupported("geometry")` and are queried through `database/geo.ts` raw SQL |
| Queues | BullMQ on Redis | Cutoff jobs, reminders, webhook retries, payouts |
| Realtime | socket.io + Redis adapter | Vendor/admin live orders, chat |
| API client (TS) | openapi-typescript + openapi-fetch in `packages/api-client` | Generated from Swagger, no hand-written calls |
| API client (Dart) | openapi-generator `dart-dio` | Same contract for Flutter |
| Flutter state/nav | Riverpod + go_router | Mainstream, testable |
| Web i18n | next-intl | `/ar` and `/en` routes, RTL |
| Dashboard UI | shadcn/ui + Tailwind + TanStack Table | Fast admin CRUD, RTL via logical classes |
| Validation | class-validator (API), zod (web forms) | — |
| Tests | Jest (API unit), supertest (API e2e), flutter_test, Playwright (web/dashboard smoke) | — |
| CI | GitHub Actions, path-filtered per app | Only affected apps build |

## Consequences
Changing any of these choices needs a new ADR.
