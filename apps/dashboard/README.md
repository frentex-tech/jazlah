# Jazlah — Dashboards

One Next.js app with role-based areas:
- **Admin** (Jazlah team): operations, catalog, orders, vendors, finance, marketing, feed moderation, settings
- **Vendor** (partner butchers / slaughterhouses): store, products, orders, visits, earnings
- **Kitchen** (contracted kitchens): assigned cooking orders

Commit scope: `dashboard`.

## Stack
Next.js 15 (App Router) · React 19 · next-intl (`ar` default, `en`; `/admin` is Arabic, `/en/admin` English) · Tailwind 3 with the shared preset `packages/config/tailwind-preset.ts` · shadcn/ui conventions (`components.json`, RTL) · TanStack Table · react-hook-form + zod · `@phosphor-icons/react` · Playwright.

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

## Mocks
- `/api/mock/orders` + `/admin/table-demo`: the DataTable demo (`?fail=1` shows the error state).
