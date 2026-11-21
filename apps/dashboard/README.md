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
pnpm test:e2e       # Playwright suite on the mocks; starts `pnpm start`, so run `DASHBOARD_TEST_BUILD=1 pnpm build` first
pnpm test:e2e:api   # acceptance checks against a running, freshly seeded API (API_URL); CI job "api-e2e"
pnpm test:unit      # the *.test.ts self-checks
pnpm api:generate   # regenerate src/api/schema.d.ts from services/api/openapi.json
```

## API client
Types are generated from `services/api/openapi.json` with `openapi-typescript` into `src/api/schema.d.ts`, and called with `openapi-fetch` (`src/api/client.ts`), as in `docs/frontend/client-generation.md`. **The generated file is committed**; CI regenerates it and fails on a difference, so run `pnpm api:generate` after a pull that changes `openapi.json`.

API calls run on the server (route handlers, server components): the tokens live in HTTP-only cookies and never reach page scripts.

Panel route handlers wrap their API call in `withPanelSession(req, panel, call)` (`src/lib/auth/panel-session.ts`): it refreshes a missing access token, retries once on `ACCESS_TOKEN_EXPIRED`, writes the new cookies, and refuses mutating calls that don't come from our own pages. When the session is over it answers 401 `{ code }`, and the page's `panelFetch` (`src/lib/panel-fetch.ts`) sends the user to `/login?panel=…&next=…`, after saving unsaved work if the page passes `beforeSignIn`.

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
- **Customer session (vendor application, VND-DSH-1):** `/vendor/apply` and `/vendor/application` sit outside the staff shell. A visitor signs in there with `audience: customer` (same phone and code screens); the cookies are `jz_rt_customer`, `jz_at_customer`, `jz_ph_customer`, listed in `jz_panels` with the same 12 h idle timeout. Route handlers use `withPanelSession(req, 'customer', …)`. Panel guards read only their own panel's cookies, so a customer session never opens a staff panel. After approval the applicant signs in to `/login?panel=vendor` as staff. Sign-out on the status page ends the customer session only.
- Settings: `.env.example` (`API_URL`, `OTP_LENGTH`, `DASHBOARD_API_MOCK`, `MEDIA_ORIGINS`). `OTP_LENGTH` must equal the API's `AUTH_OTP_LENGTH`. Builds: see «Builds» below.
- Application drafts (sessionStorage, and localStorage for «save and finish later», 7 days) are tagged with the applicant's user id (cookie `jz_uid_customer`, set at the customer sign-in), dropped for anyone else or when older, deleted after submitting and on sign-out (and on the sign-in page when the server ended the session), and never hold the IBAN.
- Auth calls are refused unless they come from our own pages (`Sec-Fetch-Site: same-origin` and a JSON body), against login CSRF.
- The user's address is forwarded to the API as `X-Forwarded-For`, so the API's per-address code limits apply per user. It is read **only** from the header named by `CLIENT_IP_HEADER`, never from the first `X-Forwarded-For` entry (the client writes that one). Server setup:
  1. The edge proxy in front of the dashboard (ingress, nginx, ALB) must **set and overwrite** one header with the client address. With nginx, `proxy_set_header X-Real-IP $remote_addr;` and `CLIENT_IP_HEADER=x-real-ip`.
  2. If the proxy can only append to `X-Forwarded-For` (ALB), set `CLIENT_IP_HEADER=x-forwarded-for`: the dashboard then takes the right-most entry, the one that proxy added. This holds only with exactly one proxy in front of the dashboard.
  3. On the API, set `TRUST_PROXY_HOPS` so it trusts the dashboard server's `X-Forwarded-For` (one hop when the dashboard calls the API directly).
  4. With `CLIENT_IP_HEADER` unset nothing is forwarded, and every staff sign-in counts against the dashboard server's address: one burst of attempts can then block sign-in for all staff.

## Security headers
`next.config.ts` sends a CSP (`frame-ancestors 'none'`, scripts and connections from our origin, images and connections also from the map tile host in `NEXT_PUBLIC_MAP_TILES` and the media hosts in `MEDIA_ORIGINS`: the storage that presigned uploads POST to and the CDN of logos and covers), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy`, and HSTS in production builds. Set HSTS at the edge too. A change of tile provider changes the CSP at build time, so rebuild after changing `NEXT_PUBLIC_MAP_TILES`.

## Builds
- **Per environment.** The CSP (with `MEDIA_ORIGINS` and `NEXT_PUBLIC_MAP_TILES`) is fixed at build time, so staging and production each get their own build. A production build fails when `MEDIA_ORIGINS` is empty (the CSP would block every upload and logo) or holds something that is not an origin.
- **Test build, for the mock suite only:** `DASHBOARD_TEST_BUILD=1 pnpm build`. It compiles the mocks in and skips the `MEDIA_ORIGINS` check (uploads go to the mock storage on our own origin). The flag is inlined into the bundles at build time (`next.config.ts` `env`), so it cannot be switched on at runtime: a normal production build contains no mock code at all (CI checks this) and ignores `DASHBOARD_API_MOCK`. Never set `DASHBOARD_TEST_BUILD` in a deploy; the deploy job (FND-INF-5) should fail if it or `DASHBOARD_API_MOCK` is set.
- The api-e2e CI job builds a normal production image against the job's API and MinIO (`MEDIA_ORIGINS=http://localhost:9002`) and runs `e2e-api/`: coverage zones, the vendor application then its approval at 12.5% (1250 bps), a JAZLA product created, published and repriced, and a vendor product submitted and approved from the queue (both checked on `GET /v1/public/products`). It needs a freshly seeded API with `AUTH_REVIEW_ACCOUNTS=+966500000004:444444,+966500000002:222222,+966500000041:414141` (the last is a new applicant).

## API gaps (worked around in the dashboard)
- **Staff display name:** `GET /v1/<panel>/me` returns only the principal, so the top bar shows the masked phone and a user icon in the avatar.
- **Panels a phone or user can open:** the API does not list them, and tokens are per audience. So the panel picker (`/login/choose`) lists the panels with a live session, which means it appears after the second sign-in.
- **Code length:** not in the OTP request response, so it is a dashboard setting (`OTP_LENGTH`). Jazlah uses 6 digits (owner, 2026-11-18); Figma's 4 cells are an accepted difference.

## Mocks (`DASHBOARD_API_MOCK=1`)
For local work (`pnpm dev`) and the Playwright mock suite (on a test build) only; a production build has no mock code. Each feature's mock is in `backend.mock.ts` beside its `backend.ts`, loaded only through `src/lib/mock-backends.ts` (the auth mock stays in `src/lib/auth/backend.ts`, behind the same build-time test).
- Auth (`src/lib/auth/backend.ts`), like the API's review accounts. The code is the last digit six times:
  - `0500000004` admin
  - `0500000002` vendor
  - `0500000003` kitchen
  - `0500000009` all three panels
  - `0500000001` customer only (no access)
  - `0500000007` rate limited
  - `0500000008` disabled
  - code `000000` = expired
  - customer sign-in (vendor application): any number; `0500000005` has a rejected application, `0500000006` an approved one
- Vendor application, store profile and uploads (`src/features/vendor-onboarding/backend.ts`, mock in `backend.mock.ts`): the API through the generated client (`/v1/customer/vendor-applications`, `/v1/customer/media/*`, `/v1/vendor/profile`, `/v1/vendor/media/*`); the mock keeps applications per applicant, one store profile, and stands in for the upload storage at `/api/mock-storage` (mocks only). Saving the store email `suspended@example.com` answers as a suspended store.
- Admin vendor list and review (`src/features/admin-vendors/backend.ts`, mock in `backend.mock.ts`): the API through the generated client (`/v1/admin/vendor-applications*`, `/v1/admin/vendors*`); the mock shares its applications with the vendor-application mock (one submitted there is listed under «pending review») and adds the stores of the Figma list. An admin access token ending in `-limited` (cookie `jz_at_admin`) is answered NOT_ALLOWED, to show the not-allowed states.
- Admin catalog (`src/features/catalog/backend.ts`, mock in `backend.mock.ts`): the API through the generated client (`/v1/admin/lists/*`, `/v1/admin/cutting-packaging-incompatibilities*`, `/v1/admin/products*`, `/v1/admin/media/*`); the mock seeds the Figma categories, cuts, "without" items and products (three are JAZLA's own, so they open in the form), adds JAZLA's platform vendor to the admin vendors mock, and uses the vendor-onboarding upload storage. The product form (`src/features/catalog/product-form/`) takes its options, upload, rules editor and submit from the page, for reuse by the vendor screens. A `-limited` admin token is answered NOT_ALLOWED here too.
- Vendor products and the review queue (`src/features/catalog/vendor-backend.ts`, mock in `vendor-backend.mock.ts`, CAT-DSH-2): the API through the generated client (`/v1/vendor/products*`, `/v1/vendor/lists/*`, `/v1/vendor/cutting-packaging-incompatibilities`, `/v1/public/categories`, `/v1/admin/products/{id}/approve|reject`, `/v1/admin/product-change-requests*`); the mock works on the admin catalog's store, so a product the mock vendor (مجازر الفلاح) submits is in the admin queue. A vendor access token ending in `-suspended` (cookie `jz_at_vendor`) is answered VENDOR_SUSPENDED, to show the suspended-store state.
- Coverage zones (`src/features/coverage/backend.ts`, mock in `backend.mock.ts`): the API (`/v1/admin/coverage-zones`, `/v1/public/coverage/check`) through openapi-fetch; the mock is an in-memory store with the API's shapes and rules (seeded with «شمال الرياض»), for the smoke tests.
