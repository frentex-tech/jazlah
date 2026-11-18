# Jazlah — Dashboards

One Next.js app with role-based areas:
- **Admin** (Jazlah team): operations, catalog, orders, vendors, finance, marketing, feed moderation, settings
- **Vendor** (partner butchers / slaughterhouses): store, products, orders, visits, earnings
- **Kitchen** (contracted kitchens): assigned cooking orders

Commit scope: `dashboard`.

## Stack
Next.js 15 (App Router) · React 19 · MapLibre GL 5 + Terra Draw (coverage map; tiles from `NEXT_PUBLIC_MAP_TILES`, OSM by default) · next-intl (`ar` default, `en`; `/admin` is Arabic, `/en/admin` English) · Tailwind 3 with the shared preset `packages/config/tailwind-preset.ts` · shadcn/ui conventions (`components.json`, RTL) · TanStack Table · react-hook-form + zod · `@phosphor-icons/react` · Playwright.

## Package manager: pnpm
pnpm 10, pinned in `package.json` `packageManager`. Enable it once with `corepack enable` (Node 22+, `.nvmrc` says 24). npm was not needed.

```bash
pnpm install
pnpm dev            # http://localhost:3001
pnpm lint           # ESLint, incl. the RTL rule: physical utilities (ml-, pr-, left-, text-right …) are errors
pnpm typecheck
pnpm build
pnpm test:e2e       # Playwright smoke; starts `pnpm start`, so run `pnpm build` first
pnpm api:generate   # regenerate src/api/schema.d.ts from services/api/openapi.json
```

## API client
Types are generated from `services/api/openapi.json` with `openapi-typescript` into `src/api/schema.d.ts`, and called with `openapi-fetch` (`src/api/client.ts`), as in `docs/frontend/client-generation.md`. **The generated file is committed**; CI regenerates it and fails on a difference, so run `pnpm api:generate` after a pull that changes `openapi.json`.

API calls run on the server (route handlers, server components): the tokens live in HTTP-only cookies and never reach page scripts.

## Layout
```
src/app/[locale]/(auth)/login   staff sign-in (ACC-DSH-1)
src/app/[locale]/admin|vendor|kitchen   each with its layout = <Shell panel=…>
src/components/shell            Side nav, Top bar, Page header (Figma «Dashboard shell»)
src/components/ui               Button, Badge, DataTable, FiltersBar, Select, FormField, ConfirmDialog, FileUpload, StatePanel, Skeleton
src/features/<feature>          tables, forms, hooks per feature
src/middleware.ts               locale + panel guard (no session for the panel → /login?panel=…)
messages/ar.json, en.json       every UI string
```

## Design rules
- Figma is the reference: `docs/design/spec/dashboard/<node-id>.json` for screens, `docs/design/spec/ds/` for components. Comments name the Figma component each file builds.
- Colors, radii, spacing and text styles come from the preset only (`bg-brand`, `text-h1`, `rounded-md`, `gap-s24` …). Fonts: Readex Pro and El Messiri through `next/font` (Figma's Thmanyah is not bundled).
- RTL first: logical properties only. English mirrors the layout.

## Sign-in and session (ACC-DSH-1)
- `/login` (admin texts), `/login?panel=vendor|kitchen`: phone → code with `audience` = the panel. A protected page sends you to `/login?panel=…&next=…`.
- Route handlers `src/app/api/auth/*` call the API on the server and keep the tokens in HTTP-only cookies (`jz_rt_<panel>`, `jz_at_<panel>`); page scripts never see them.
- `jz_panels` lists the panels with a live session and lives 12 h, renewed on every page load: that is the idle timeout.
- The middleware refreshes an expired access token on page loads, and sends signed-in staff from `/login` to their panel (several panels: `/login/choose`).
- Settings: `.env.example` (`API_URL`, `OTP_LENGTH`, `DASHBOARD_API_MOCK`). `OTP_LENGTH` must equal the API's `AUTH_OTP_LENGTH`.
- Auth calls are refused unless they come from our own pages (`Sec-Fetch-Site: same-origin` and a JSON body), against login CSRF.
- The dashboard server forwards the user's address as `X-Forwarded-For`. Set the API's `TRUST_PROXY_HOPS` so its per-address code limits apply per user and not to the dashboard server as a whole.

## API gaps (worked around in the dashboard)
- **Staff display name:** `GET /v1/<panel>/me` returns only the principal, so the top bar shows the masked phone and a user icon in the avatar.
- **Panels a phone or user can open:** the API does not list them, and tokens are per audience. So the panel picker (`/login/choose`) lists the panels with a live session, which means it appears after the second sign-in.
- **Coverage zone color:** the editor stores a color per zone; LOC-API-1's model has no `color` field yet.
- **Code length:** not in the OTP request response, so it is a dashboard setting (`OTP_LENGTH`). Figma draws 4 digits; the API default is 6.

## Mocks (`DASHBOARD_API_MOCK=1`)
- Auth (`src/lib/auth/backend.ts`), like the API's review accounts. The code is the last digit six times:
  - `0500000004` admin
  - `0500000002` vendor
  - `0500000003` kitchen
  - `0500000009` all three panels
  - `0500000001` customer only (no access)
  - `0500000007` rate limited
  - `0500000008` disabled
  - code `000000` = expired
- `/api/mock/orders` + `/admin/table-demo`: the DataTable demo (`?fail=1` shows the error state).
- Coverage zones (`src/features/coverage/backend.ts`): LOC-API-1 (#24) is not in `openapi.json` yet. The `CoverageBackend` interface has an in-memory mock (seeded with «شمال الرياض») behind the dashboard's own routes `/api/coverage/zones[/:id]` and `/api/coverage/check`. Without the mock these answer 501 `NOT_BUILT`. When the API lands, implement the interface with openapi-fetch.
