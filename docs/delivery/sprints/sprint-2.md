# Sprint 2 — Vendors, catalog & storefront

> **Goal:** partner vendors can apply and be approved. Jazlah and partners manage products with sizes, cuts, packaging and exclusions. Customers browse home, stores and products and search, in the app and on the web.

**Release:** v0.2.0

**Exit criteria (demo on staging):**
- A vendor applies with documents → admin approves with a commission % → vendor edits the store profile and adds a product → admin approves it → it appears in the app.
- An admin creates a Jazlah carcass product with 3 sizes, cuts (one with an extra price), packaging with one incompatible combination, and exclusions.
- The app and web product page compute the total correctly for every combination and block incompatible ones.
- Arabic search with spelling variants finds products (e.g. "نعيمي" / "نعيمى").

**Merge points:**
- MP-1: VND-API-1 → CAT-API-1 (model + pricing) → CAT-API-3 → CAT-API-5. The pricing service in CAT-API-1 is reused by the cart, checkout, occasions and Adha, so freeze its interface here.
- MP-2: dashboard catalog (CAT-DSH-1) merges before the storefront client tasks so staging has real data.
- MP-4: REL-INF-2.

**Parallel tracks:** Backend: VND-API-*, CAT-API-* · Dashboard: VND-DSH-*, CAT-DSH-* · Mobile: STF-MOB-* · Web: STF-WEB-* · Design: VND-DES-1, STF-DES-1

## EPIC VND — Vendor onboarding & store profile
- reqs: FR-VND-01, FR-VND-02, FR-ADM-04
Partner butchers and slaughterhouses apply, get reviewed, and manage their store. **Jazlah itself is vendor #1** (`isPlatform = true`), so all catalog and order logic treats Jazlah and partners the same way.

### VND-DES-1 — Screens: vendor onboarding, store profile & product management
`type: Task · area: design · size: M · prio: P0 · reqs: FR-VND-01, FR-VND-02, FR-ADM-04, FR-ADM-02, FR-VND-03 · depends: DSN-DES-1`

**What:** dashboard screens for vendor onboarding.

This task also covers:
- **Screens: product management (admin & vendor):** dashboard product management UX.

**Output:**

*Screens: vendor application, store profile, admin review*
- public apply page (multi-step: business info, documents, bank, location, photos), application status page, vendor store profile form, admin vendor list and review page (document viewer, approve with commission, reject with reason, suspend)

*Screens: product management (admin & vendor)*
- categories list, product list, product form with sections (basics, images, sizes, cuts, packaging, exclusions, compatibility matrix, fulfilment, availability), review queue, rejection feedback for vendors

**Where:** Figma (link in the issue)

**Acceptance:**
- [ ] AR/EN, all states, reviewed by developers
- [ ] The compatibility matrix is usable with 6 cuts × 4 packaging options

### VND-API-1 — Vendor model & application submission
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-VND-01 · depends: ACC-API-1, FND-API-4`

**What:** vendors apply to join the platform.

**Output:**
- `Vendor` model: type butcher|slaughterhouse|farm, legalName, displayNameAr/En, slug, crNumber, vatNumber?, healthCertMediaId, crMediaId, iban (encrypted at rest), bankName, accountHolder, point, address, city, photos[], status pending|approved|rejected|suspended, rejectionReason?, commissionRateBps, isPlatform, ownerUserId
- `POST /v1/public/vendor-applications`: the applicant first verifies their phone via OTP (customer audience), then submits with the access token → creates the vendor `pending` and links the owner
- `GET /v1/customer/vendor-application` → status and reason (the applicant still only has the `customer` role until approved)
- Seed: the Jazlah vendor (`isPlatform=true`, approved, commission 0)

**How:**
- Validate Saudi IBAN format (SA + 22 digits) with mod-97 checksum, CR number (10 digits) and VAT (15 digits starting and ending with 3) when given.
- Encrypt the IBAN with AES-256-GCM using a key from config. Only admins and the owner see it, masked except the last 4 digits.
- Events: `vendor.application.submitted`.

**Where:** `services/api/src/modules/vendors/`

**Acceptance:**
- [ ] e2e: submission creates a pending vendor; duplicate CR returns `VENDOR_CR_EXISTS`
- [ ] IBAN is unreadable in the DB and masked in API responses

### VND-API-2 — Admin vendor review + vendor store profile endpoints
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-ADM-04, FR-VND-02, FR-CAT-02 · depends: VND-API-1`

**What:** admins decide on applications and manage vendors.

This task also covers:
- **Vendor store profile & public store endpoint:** vendors manage what customers see about their store.

**Output:**

*Admin vendor review, commission & suspension*
- `GET /v1/admin/vendors` (filters: status, type, city, search), `GET /v1/admin/vendors/:id` (with signed document URLs), `POST …/approve` `{commissionRateBps}` (grants role `vendor_owner`), `POST …/reject` `{reason}`, `POST …/suspend` / `…/reactivate` `{reason}`; all audited; events `vendor.approved|rejected|suspended`

*Vendor store profile & public store endpoint*
- `GET/PATCH /v1/vendor/store` (logo, cover, descriptionAr/En, workingHours weekly JSON, pickupEnabled, pickupInstructions, visitsEnabled, phone for customers); `GET /v1/public/stores/:slug` (public fields + rating placeholder + location for pickup)

**How:**

*Admin vendor review, commission & suspension*
- suspending hides the vendor's products from the storefront immediately (cache invalidation) and blocks new orders. Existing orders continue.

**Where:** `services/api/src/modules/vendors/controllers/admin.controller.ts`, `services/api/src/modules/vendors/`

**Acceptance:**
- [ ] e2e: approve → vendor can log into the dashboard with `audience=staff`
- [ ] Suspended vendor's products disappear from `/v1/public/*`
- [ ] e2e: only approved vendors are returned publicly

### VND-DSH-1 — Dashboard: vendor application, status & store profile
`type: Feature · area: dashboard · size: L · prio: P0 · reqs: FR-VND-01, FR-VND-02 · depends: VND-API-1, VND-DES-1, ACC-DSH-1, VND-API-2`

**What:** public "join Jazlah" flow inside the dashboard app.

This task also covers:
- **Dashboard: vendor store profile:** vendors edit their store page.

**Output:**

*Dashboard: vendor application & status pages*
- `/[locale]/vendor/apply`: OTP, then a multi-step form with document uploads (presigned), map location and IBAN; `/[locale]/vendor/application` status page (pending, rejected with reason and re-apply, approved → go to dashboard)

*Dashboard: vendor store profile*
- `/vendor/store` form: logo/cover upload, AR/EN descriptions, weekly working hours editor, pickup toggle + instructions, visits toggle, preview link to the public store page

**Where:** `apps/dashboard/src/app/[locale]/vendor/apply`, `apps/dashboard/src/features/vendor-onboarding/`, `apps/dashboard/src/app/[locale]/vendor/store`

**Acceptance:**
- [ ] A full application can be submitted on staging
- [ ] Client-side validation mirrors the API (IBAN, CR)
- [ ] Changes reflect on the public store endpoint after save

### VND-DSH-2 — Dashboard: admin vendor list & review
`type: Feature · area: dashboard · size: M · prio: P0 · reqs: FR-ADM-04 · depends: VND-API-2, VND-DES-1`

**What:** admins review and manage vendors.

**Output:** `/admin/vendors` table (status tabs, search), detail page with documents viewer, approve dialog (commission %), reject dialog (reason), suspend/reactivate

**Where:** `apps/dashboard/src/app/[locale]/admin/vendors`

**Acceptance:**
- [ ] Actions update the table without a full reload and show toasts

## EPIC CAT — Catalog, product options & pricing
- reqs: FR-PRD-01, FR-PRD-02, FR-PRD-03, FR-PRD-04, FR-PRD-05, FR-PRD-06, FR-PRD-07, FR-ADM-02, FR-VND-03
The product model (sizes, cuts, packaging, exclusions, compatibility), the authoritative pricing service, admin and vendor product management, and moderation.

### CAT-API-1 — Catalog data model + authoritative pricing service
`type: Task · area: api · size: L · prio: P0 · reqs: FR-PRD-01, FR-PRD-02, FR-PRD-03, FR-PRD-04, FR-PRD-05, FR-PRD-07, FR-PRD-06 · depends: FND-API-1, VND-API-1`

**What:** the schema for everything sold on the platform, and the single pricing function.

Data model (Prisma models + migration):
- `Category` (slug, nameAr/En, icon, sortOrder, isActive). Seed: ذبائح، لحوم بالكيلو، مفروم، مشاوي، ذبائح المناسبات، أطباق مطبوخة
- `MeatType` lookup (e.g. نعيمي، حري، سواكني، نجدي، تيس، حاشي…) seeded
- `Product` (vendorId, categoryId, **slug** (unique, from the English name), meatTypeId?, nameAr/En, descriptionAr/En, images[] ordered, orderType ready_meat|carcass|cooked|occasion|adha, fulfilment delivery|pickup|both, status draft|pending_review|approved|rejected, rejectionReason?, isAvailable, isFeatured, sortOrder, salesCount)
- `ProductSize` (nameAr/En, approxWeightKg?, servesPeople?, priceHalalas, tags[], isDefault, isAvailable)
- `CutOption`, `PackagingOption` (nameAr/En, extraPriceHalalas, isAvailable)
- `ExclusionOption` (nameAr/En, e.g. بدون رأس، بدون كوارع، بدون كرشة، بدون كبدة، بدون لية)
- `CutPackagingRule` (cutId, packagingId, allowed=false) for incompatible pairs

This task also covers:
- **Pricing service (authoritative line price):** one function that prices a configured product line. The cart, checkout, occasions and Adha all use it.

**Output:**

*Pricing service (authoritative line price)*
- `PricingService.priceLine({productId, sizeId, cutId?, packagingId?, exclusionIds[], quantity})` → `{unitPrice, lineTotal, breakdown[], errors[]}`; error codes `PRODUCT_UNAVAILABLE`, `SIZE_UNAVAILABLE`, `CUT_PACKAGING_INCOMPATIBLE`, `OPTION_NOT_IN_PRODUCT`

**How:**

*Catalog data model*
- options belong to the product (not global) so each vendor controls their own. Add indexes on (vendorId, status), (categoryId, status, isAvailable) and a trigram index on names.

*Pricing service (authoritative line price)*
- `unitPrice = size.price + cut.extra + packaging.extra`, `lineTotal = unitPrice × quantity`. Prices include VAT. Keep it pure (load data first, then compute) for easy testing.

**Where:** `services/api/prisma/schema.prisma`, `services/api/src/modules/catalog/`, `services/api/src/modules/pricing/`

**Acceptance:**
- [ ] Migration applies cleanly; seed creates categories and meat types
- [ ] ERD snippet added to `docs/architecture.md` (catalog section)
- [ ] Table-driven unit tests cover every combination type, including an incompatible pair and an unavailable size
- [ ] 100% branch coverage on the pricing function

### CAT-API-3 — Catalog management endpoints (admin + vendor) & moderation queue
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-ADM-02, FR-VND-03, FR-ADM-04 · depends: CAT-API-1, FND-API-4`

**What:** admins manage categories and Jazlah's products.

This task also covers:
- **Vendor product endpoints & moderation queue:** partners manage their own products, and admins approve them before they go live.

**Output:**

*Admin catalog management endpoints*
- `/v1/admin/categories` CRUD + reorder; `/v1/admin/products` CRUD for any vendor (Jazlah's are approved directly), nested option CRUD (sizes, cuts, packaging, exclusions, rules) in one payload with diffing; availability toggle `PATCH …/availability`; image attach via mediaIds; audited

*Vendor product endpoints & moderation queue*
- `/v1/vendor/products` CRUD scoped to the caller's vendor; submitting moves a product to `pending_review`; `GET /v1/admin/products/review-queue`, `POST /v1/admin/products/:id/approve|reject {reason}`; events `product.review.requested|approved|rejected`

**How:**

*Admin catalog management endpoints*
- use a transactional upsert of nested options so the dashboard can save the whole form at once. Invalidate catalog caches on every change.

*Vendor product endpoints & moderation queue*
- after approval, editing price or availability doesn't need re-review. Editing name, images, category or options does (configurable list in code).

**Where:** `services/api/src/modules/catalog/controllers/admin.controller.ts`, `services/api/src/modules/catalog/controllers/vendor.controller.ts`

**Acceptance:**
- [ ] e2e: saving a product with nested options and then removing one option deletes only that option
- [ ] e2e: a vendor cannot read or edit another vendor's product (404)
- [ ] Rejected products return the reason to the vendor

### CAT-API-5 — Public catalog (home, categories, stores, product) + Arabic search
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-CAT-01, FR-CAT-02, FR-PRD-01, FR-CAT-03 · depends: CAT-API-1, VND-API-2`

**What:** read endpoints for the storefront.

This task also covers:
- **Search & filters with Arabic normalization:** global product search across all vendors.

**Output:**

*Public catalog: home feed, categories, stores, product detail*
- `GET /v1/public/home` → `{banners[] (empty until CMS-API-1), categories[], bestSellers[], featured[], partnerStores[]}`; `GET /v1/public/categories/:slug/products` (paged, sort); `GET /v1/public/stores/:slug/products`; `GET /v1/public/products/:id` (all options + rules + vendor summary)

*Search & filters with Arabic normalization*
- `GET /v1/public/search?q=&category=&meatType=&vendor=&priceMin=&priceMax=&sort=relevance|price_asc|price_desc|popular&page=`; each result includes the vendor name; facets (counts per category and vendor)
- `GET /v1/public/products/by-slug/:slug` and `GET /v1/public/stores/:slug` for SEO-friendly web URLs

**How:**

*Public catalog: home feed, categories, stores, product detail*
- only approved and available products of approved, non-suspended vendors. Optional `lat/lng` hides delivery-only products when out of coverage. Redis cache for 5 min with tag invalidation. `bestSellers` uses `salesCount` (updated from orders in Sprint 3, ORD-API-1) and falls back to `isFeatured`.

*Search & filters with Arabic normalization*
- a generated `searchVector` column built from normalized AR/EN names (strip tashkeel, unify أ/إ/آ→ا, ى→ي, ة→ه, remove tatweel) + `unaccent`; combine full-text rank with `pg_trgm` similarity for typos. The normalizer lives in `search/normalize.ts` and also runs on the query.

**Where:** `services/api/src/modules/catalog/controllers/public.controller.ts`, `services/api/src/modules/search/`

**Acceptance:**
- [ ] p95 < 200 ms on cached home (local benchmark)
- [ ] e2e: a pending product never appears publicly
- [ ] Unit tests for the normalizer
- [ ] "نعيمى" finds "نعيمي", and "naimi" finds English names

### CAT-DSH-1 — Dashboard: categories & Jazlah product management
`type: Feature · area: dashboard · size: L · prio: P0 · reqs: FR-ADM-02, FR-PRD-02, FR-PRD-03, FR-PRD-04, FR-PRD-05, FR-PRD-07 · depends: CAT-API-3, VND-DES-1`

**What:** the admin catalog screens.

**Output:** `/admin/catalog/categories` (list, reorder by drag, edit), `/admin/catalog/products` (table with filters by vendor/category/status, availability quick-toggle), product form with sections: basics, images (drag-sort upload), sizes editor, cuts editor, packaging editor, exclusions editor, cut×packaging compatibility matrix, fulfilment, orderType, featured

**How:** build the product form as a reusable feature component (`features/catalog/product-form`) because the vendor screens reuse it (CAT-DSH-2).

**Where:** `apps/dashboard/src/app/[locale]/admin/catalog`, `apps/dashboard/src/features/catalog/`

**Acceptance:**
- [ ] The exit-criteria product can be created entirely from the UI
- [ ] Validation errors from the API map to the right fields

### CAT-DSH-2 — Dashboard: vendor products & admin review queue
`type: Feature · area: dashboard · size: M · prio: P0 · reqs: FR-VND-03, FR-ADM-04 · depends: CAT-API-3, CAT-DSH-1`

**What:** vendors manage their products.

This task also covers:
- **Dashboard: admin product review queue:** admins approve or reject vendor products.

**Output:**

*Dashboard: vendor products & submission for review*
- `/vendor/products` list with status badges (draft, in review, approved, rejected + reason), the shared product form, "submit for review" action, availability toggle

*Dashboard: admin product review queue*
- `/admin/catalog/review` queue with a product preview (as the customer would see it), approve/reject with reason, sidebar badge with pending count

**Where:** `apps/dashboard/src/app/[locale]/vendor/products`, `apps/dashboard/src/app/[locale]/admin/catalog/review`

**Acceptance:**
- [ ] Editing a review-sensitive field shows a "will be re-reviewed" warning
- [ ] Approving removes the item from the queue and it becomes public

## EPIC STF — Storefront (customer browsing)
- reqs: FR-CAT-01, FR-CAT-02, FR-CAT-03, FR-PRD-01, FR-PRD-06
Home, category, store, product detail with customization, and search, in the app and on the web.

### STF-DES-1 — Screens: home, category, store, product detail, search
`type: Task · area: design · size: M · prio: P0 · reqs: FR-CAT-01, FR-CAT-02, FR-CAT-03, FR-PRD-01, FR-PRD-06 · depends: DSN-DES-1`

**What:** customer browsing screens for mobile and web.

**Output:** home (banners, categories, best sellers, partner stores, hidden stories row slot), category list, store page, product detail with customization (size, cut, packaging with disabled states, exclusions, notes, quantity, sticky total + add to cart), search with filters sheet

**Where:** Figma (link in the issue)

**Acceptance:**
- [ ] Product detail shows how an incompatible option looks and why

### STF-MOB-1 — Mobile: home, category & store pages
`type: Feature · area: mobile · size: L · prio: P0 · reqs: FR-CAT-01, FR-CAT-02 · depends: CAT-API-5, STF-DES-1, LOC-MOB-1`

**What:** the first screen customers see.

This task also covers:
- **Mobile: category & store pages:** product listings.

**Output:**

*Mobile: home screen*
- `features/home`: location header, banners carousel, categories grid, best sellers rail, partner stores rail, pull-to-refresh, skeleton loading, offline/error state

*Mobile: category & store pages*
- `features/store`: category page (paged grid, sort), store page (header with logo, rating placeholder, pickup badge, info sheet with hours and location), the vendor name on every product card

**Where:** `apps/mobile/lib/features/home/`, `apps/mobile/lib/features/store/`

**Acceptance:**
- [ ] Tapping any item routes to the right category, store or product
- [ ] Golden test for the home layout in AR and EN
- [ ] Infinite scroll loads the next page without duplicates

### STF-MOB-3 — Mobile: product detail & customization
`type: Feature · area: mobile · size: L · prio: P0 · reqs: FR-PRD-01, FR-PRD-02, FR-PRD-03, FR-PRD-04, FR-PRD-05, FR-PRD-06, FR-PRD-07 · depends: CAT-API-5, CAT-API-1, STF-DES-1`

**What:** configure a product before adding it to the cart.

**Output:** `features/product`: image gallery, vendor link, size selector (weight, tags), cut list with extra prices, packaging list (incompatible options disabled with a hint), exclusions multi-select, notes, quantity stepper, sticky total updated live, fulfilment badge (delivery/pickup), "Add to cart" (calls the cart in CRT-MOB-1; until then it shows a placeholder)

**How:** the client computes the displayed total with the same formula as CAT-API-1 (pure function in `domain/price.dart` with unit tests). The server stays authoritative in the cart.

**Where:** `apps/mobile/lib/features/product/`

**Acceptance:**
- [ ] Unit tests: client price == server price for the seeded combinations
- [ ] An incompatible cut/packaging pair can't be selected

### STF-MOB-4 — Mobile: search & filters
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-CAT-03 · depends: CAT-API-5, STF-DES-1`

**What:** search all products.

**Output:** `features/search`: search bar with debounce, recent searches (local), results with vendor names, filters sheet (category, meat type, vendor, price range), sort, empty state with suggestions

**Where:** `apps/mobile/lib/features/search/`

**Acceptance:**
- [ ] Filters and query persist when returning from a product page

### STF-WEB-1 — Web: home, category & store pages (SSR + SEO)
`type: Feature · area: web · size: L · prio: P0 · reqs: FR-CAT-01, FR-CAT-02 · depends: CAT-API-5, STF-DES-1, APP-WEB-1`

**What:** indexable storefront pages.

**Output:** `/[locale]` home, `/[locale]/categories/[slug]`, `/[locale]/stores/[slug]` with ISR (revalidate 300 s + on-demand revalidation webhook later), metadata AR/EN, `hreflang`, Open Graph, `sitemap.xml` and `robots.txt`

**Where:** `apps/web/src/app/[locale]/(shop)/`

**Acceptance:**
- [ ] Lighthouse SEO ≥ 95 on home and a store page
- [ ] Pages render meaningful HTML with JS disabled

### STF-WEB-2 — Web: product page with customization + search page
`type: Feature · area: web · size: L · prio: P0 · reqs: FR-PRD-01, FR-PRD-02, FR-PRD-03, FR-PRD-04, FR-PRD-05, FR-PRD-06, FR-PRD-07, FR-CAT-03 · depends: CAT-API-5, STF-DES-1`

**What:** product configuration on the web.

This task also covers:
- **Web: search page:** search with filters on the web.

**Output:**

*Web: product page with customization*
- `/[locale]/products/[slug]` (the API also accepts `GET /v1/public/products/by-slug/:slug`, added in CAT-API-5) (server-rendered details + client configurator with the same rules as mobile), schema.org `Product` JSON-LD, shared `lib/price.ts` with unit tests

*Web: search page*
- `/[locale]/search` with URL-synced query and filters (shareable links), facets, pagination

**Where:** `apps/web/src/app/[locale]/(shop)/products/[slug]`, `apps/web/src/app/[locale]/(shop)/search`

**Acceptance:**
- [ ] Unit tests: price parity with the API seed combinations
- [ ] Back/forward navigation restores filters

## EPIC REL — Releases & merge points
Sprint-end merge points. Each task cuts a release branch, verifies the sprint's exit criteria on staging, merges to `main`, tags, back-merges to `develop` and updates STATUS.md.

### REL-INF-2 — Release v0.2.0 (Sprint 2 merge point)
`type: Task · area: infra · size: XS · prio: P0 · depends: VND-DSH-2, VND-DSH-1, CAT-DSH-2, STF-MOB-1, STF-MOB-3, STF-MOB-4, STF-WEB-1, STF-WEB-2`

**What:** close Sprint 2.

**Output:** `release/v0.2.0` → `main`, tag, back-merge, mobile staging build, STATUS.md updated

**Where:** git, `docs/delivery/STATUS.md`

**Acceptance:**
- [ ] Exit criteria demoed and ticked in the release PR
