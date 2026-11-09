# Sprint 5 — Special services: occasions, kitchens & Eid al-Adha (+ production environment)

> **Goal:** the services that set Jazlah apart. Custom occasion orders with quotes and deposits, cooking through contracted kitchens, and the platform-wide Eid al-Adha season. Production is provisioned in parallel so live-provider onboarding can start.

**Release:** v0.5.0

**Exit criteria (demo on staging):**
- Occasion: a customer requests 5 carcasses + cooking for a wedding → admin adjusts the quote → customer pays a 30% deposit → the balance is collected before the date → it runs through the normal order stages.
- Cooking: "cook it for me" on a Jazlah carcass → auto-assigned to a kitchen in the zone → meat transfer shipment Jazlah → kitchen → the kitchen dashboard moves it to ready → the customer's shipment is picked up from the kitchen.
- Adha: the admin activates the season with 4 days and per-day capacity → Adha items require prepayment, can't be mixed with regular items, and only show season days and allowed cuts.
- The production environment exists on the production domains (not yet public).

**Merge points:**
- MP-1: KIT-API-1 (incl. the cook option in cart/order/pricing) → OCC-API-1 → OCC-API-2. ADH-API-1 extends the Sprint 3 scheduling engine, so review it with SCH-QA-1's test plan.
- MP-2: dashboard tasks (OCC-DSH-1, KIT-DSH-1, ADH-DSH-1) merge before their customer flows.
- MP-4: REL-INF-5.

**Parallel tracks:** Backend: OCC/KIT/ADH-API · Dashboard: OCC-DSH-1, KIT-DSH-1, ADH-DSH-1 · Mobile: OCC-MOB-1, KIT-MOB-1, ADH-MOB-1 · Web: SVC-WEB-1 · DevOps: HRD-INF-1 · Design: OCC-DES-1 · QA: SVC-QA-1

## EPIC OCC — Occasion sacrifices
- reqs: FR-OCC-01, FR-OCC-02, FR-OCC-03, FR-OCC-04, FR-OCC-05, FR-ADM-08
Custom orders for weddings, aqiqah and similar events: an instant estimate, an admin quote for large orders, a deposit then the balance, separate lead time and capacity.

### OCC-DES-1 — Screens: occasions, visits, cooking & Adha (mobile, web, dashboard)
`type: Task · area: design · size: L · prio: P0 · reqs: FR-OCC-01, FR-VIS-01, FR-KIT-01, FR-ADH-01 · depends: DSN-DES-1`

**What:** every screen this sprint needs, designed together because the four flows share components (date and slot pickers, deposits, status timelines).

**Output:** occasion request wizard, quote review and accept, deposit/balance payment; visit booking, booking detail with map, "my animals" with deposit and scheduling; cooked dishes section and "cook it for me" option; Adha season landing, day picker, cut restrictions; dashboard screens for occasion review/pricing, vendor visits calendar and animal registration, kitchens admin, kitchen board, Adha settings and per-day board

**Where:** Figma (link in the issue)

**Acceptance:**
- [ ] AR/EN with all states; both developers signed off

### OCC-API-1 — Occasion requests, estimate, quote & conversion to orders
`type: Feature · area: api · size: XL · prio: P0 · reqs: FR-OCC-01, FR-OCC-02, FR-OCC-04, FR-OCC-05, FR-ADM-08 · depends: CAT-API-1, ORD-API-2, SCH-API-2, KIT-API-1`

**What:** the occasion lifecycle from request to fulfilment.

**Output:**
- `OccasionType` lookup (wedding, aqiqah, funeral/عزاء, eid gathering, other), `OccasionRequest` (userId, typeId, eventDate, eventTime, fulfilment + address/pickup, lines [{productId, sizeId, qty, cutId, packagingId, exclusionIds, cookDishId?}], notes, estimateHalalas, quotedHalalas?, quoteNote?, status draft|submitted|needs_quote|quoted|accepted|deposit_paid|scheduled|fulfilled|cancelled|expired, depositPct snapshot, balanceDueAt)
- `POST /v1/customer/occasions/estimate` (prices via `PricingService` + cooking extras), `POST /v1/customer/occasions` (submit), `GET` list/detail, `POST …/accept-quote`, `POST …/cancel`
- Review rule: requests above `occasions.reviewThreshold` (carcass count or amount) or with special notes → `needs_quote`; otherwise auto `quoted` at the estimate
- Lead time `ops.cutoffs.occasion.leadDays` and a separate daily carcass capacity `occasions.carcassesPerDay`, through `SchedulingService` / `CapacityService` (reserve on deposit)
- On deposit: creates the underlying `Order` via `OrdersService.createOrder` (source `occasion`) (orderType occasion) linked to the request, which then follows the normal order states (FR-OCC-05)
- Admin: `GET /v1/admin/occasions` (queue), `POST …/quote {amount, note}`, settings keys `occasions.depositPct`, `occasions.reviewThreshold`, `occasions.balanceDueDaysBefore`, `occasions.quoteValidityHours`
- Reminder jobs: D-3 and D-1 before the event (push + SMS), balance-due reminders

**How:** quotes expire after `quoteValidityHours` (job → `expired`). Cancellation before the deposit is free. After the deposit, refunds follow the order cancellation rules (before slaughter: full).

**Where:** `services/api/src/modules/occasions/`

**Acceptance:**
- [ ] e2e: small request → auto-quoted → accept → deposit → order created with the right totals and capacity reserved
- [ ] e2e: large request → `needs_quote` → admin quote → accept
- [ ] Expired quotes can't be accepted

### OCC-API-2 — Deposits & balance payments
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-OCC-03 · depends: OCC-API-1, PAY-API-1`

**What:** pay an occasion in two parts, or all at once.

**Output:** `POST /v1/customer/occasions/:id/pay {part: deposit|full|balance, method}` using `PaymentsService` purposes `occasion_deposit` / `occasion_balance`; balance options: pay online before `balanceDueAt` or collect on delivery (COD for the balance only if `ops.cod` allows the occasion type); an unpaid balance at the due date → admin alert, and the order is held from `preparing`

**Where:** `services/api/src/modules/occasions/`, `services/api/src/modules/payments/`

**Acceptance:**
- [ ] e2e: deposit + balance = quoted total; a refund on cancellation covers both payments

### OCC-DSH-1 — Dashboard: occasions queue, quoting & settings
`type: Feature · area: dashboard · size: M · prio: P0 · reqs: FR-ADM-08, FR-OCC-02 · depends: OCC-API-1`

**What:** admins review and price occasion requests.

**Output:** `/admin/occasions`: queue by status (needs quote first), detail with lines, estimate vs quote editor, note to the customer, payment status (deposit/balance), link to the created order; settings page section (deposit %, review threshold, balance due days, quote validity, occasion capacity)

**Where:** `apps/dashboard/src/app/[locale]/admin/occasions`

**Acceptance:**
- [ ] Sending a quote notifies the customer and updates the status

### OCC-MOB-1 — Mobile: occasion request flow
`type: Feature · area: mobile · size: L · prio: P0 · reqs: FR-OCC-01, FR-OCC-02, FR-OCC-03, FR-OCC-05 · depends: OCC-API-2, OCC-DSH-1, OCC-DES-1, PAY-MOB-1`

**What:** customers order for an event.

**Output:** `features/occasions`: entry from home and the Services tab, a wizard (type → date/time respecting the lead time → lines with product/size/qty/cut/packaging/exclusions/cooking → delivery or pickup → notes), live estimate, submit, request detail (status, quote, accept), deposit/full/balance payment through the shared payment flow, then tracking via the linked order

**Where:** `apps/mobile/lib/features/occasions/`

**Acceptance:**
- [ ] Dates earlier than the lead time are disabled
- [ ] The full flow works on staging, including a quote round-trip

## EPIC KIT — Cooking through contracted kitchens
- reqs: FR-KIT-01, FR-KIT-02, FR-KIT-03, FR-KIT-04, FR-ADM-07, FR-KDB-01, FR-KDB-02
Jazlah sells cooked dishes and a "cook it for me" option. Orders are assigned to contracted kitchens that work from their own dashboard. Delivery picks up from the kitchen.

### KIT-API-1 — Kitchens, dishes & cooking option
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-KIT-01, FR-KIT-02, FR-ADM-07 · depends: CAT-API-3, ADM-API-1`

**What:** model kitchens and what they cook.

**Output:** `Kitchen` (name, point, address, zoneIds[] served, dailyCapacity, isActive, users with role `kitchen`), `Dish` (nameAr/En, e.g. mandi, kabsa, mufatah; servesPeople; kitchen-side cost for reporting); cooked-dish products are Jazlah products in category أطباق مطبوخة with `orderType=cooked`; `ProductCookOption` (productId of a Jazlah carcass, dishId, extraPriceHalalas) priced through `PricingService`; admin CRUD `/v1/admin/kitchens`, `/v1/admin/dishes`, kitchen users invited by phone
- **Cart and order changes:** `cookDishId?` on `CartItem` and `OrderItem` (+ snapshot), `PricingService.priceLine` extended with `cookDishId` (adds the cook option's extra price; validates the option belongs to the product). This is the **only** sanctioned change to the frozen pricing interface, covered by the existing pricing tests

**Where:** `services/api/src/modules/kitchens/`, `services/api/src/modules/pricing/`

**Acceptance:**
- [ ] Pricing unit tests include the cook option
- [ ] A kitchen user can log in with staff OTP and lands on `/kitchen`

### KIT-API-2 — Cooking order flow & kitchen assignment
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-KIT-03, FR-KIT-04, FR-KDB-01, FR-KDB-02 · depends: KIT-API-1, DLV-API-1, SCH-API-2`

**What:** route cooking work and track it.

**Output:**
- `CookingJob` (orderId, kitchenId, dishId, servings, dueAt, status assigned|meat_preparing|meat_sent|received|cooking|ready|picked_up, assignedBy auto|admin)
- Assignment on order confirmation: auto (the kitchen whose zones contain the address, with remaining capacity for the day, nearest first) or manual by admin (`POST /v1/admin/cooking-jobs/:id/assign {kitchenId}`); no kitchen available → admin alert
- Flow: Jazlah marks the meat prepared/sent → kitchen `received` → `cooking` → `ready` → the shipment is created with the **kitchen as pickup point** (DLV port) → delivered
- Kitchen endpoints: `GET /v1/kitchen/jobs?date`, `POST /v1/kitchen/jobs/:id/{received|cooking|ready}`, `…/request-courier`; realtime `kitchen:{id}`
- Lead time `ops.cutoffs.cooked` and per-kitchen capacity counted in the scheduling engine for orders containing cooked items

**How:**
- The DLV-API-1 `ready` listener **must skip** orders that have a cooking job. For those, the shipment to the customer is created when the kitchen marks `ready`, with the kitchen as pickup.
- Meat transfer Jazlah → kitchen: an internal shipment through the same delivery port (pickup = Jazlah, drop-off = kitchen, no COD, not visible to the customer), created when Jazlah marks the meat `meat_sent`. With the manual adapter, Jazlah's own driver is recorded.

**Where:** `services/api/src/modules/kitchens/`, `services/api/src/modules/orders/`

**Acceptance:**
- [ ] e2e: auto-assign picks the right kitchen; full capacity → next kitchen or admin alert
- [ ] e2e: kitchen `ready` creates a shipment with the kitchen's address as pickup

### KIT-DSH-1 — Dashboard: kitchens admin & kitchen board
`type: Feature · area: dashboard · size: L · prio: P0 · reqs: FR-ADM-07, FR-KDB-01, FR-KDB-02 · depends: KIT-API-2`

**What:** admins manage kitchens; kitchens work their queue.

**Output:** `/admin/kitchens` (CRUD, zones served, capacity, users, dishes), `/admin/cooking` (jobs by day and status, manual assign/reassign, meat sent action); `/kitchen` board: today's and upcoming jobs sorted by due time, dish, servings, notes, actions received → cooking → ready (requests courier), sound on new assignment

**Where:** `apps/dashboard/src/app/[locale]/admin/{kitchens,cooking}`, `apps/dashboard/src/app/[locale]/kitchen`

**Acceptance:**
- [ ] A kitchen user only sees their own kitchen's jobs

### KIT-MOB-1 — Mobile: cooked dishes & "cook it for me"
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-KIT-01, FR-KIT-02 · depends: KIT-API-2, STF-MOB-3, OCC-DES-1`

**What:** order cooked food.

**Output:** cooked dishes category with servings info; a "Cook it for me" section on eligible Jazlah carcass products (dish choice + extra price in the live total); cooking stages in the order timeline (prepared at Jazlah → at the kitchen → cooking → ready → on the way)

**Where:** `apps/mobile/lib/features/cooking/`, `apps/mobile/lib/features/product/`

**Acceptance:**
- [ ] Client price parity tests include the cook option

## EPIC ADH — Eid al-Adha season
- reqs: FR-ADH-01, FR-ADH-02, FR-ADH-03, FR-ADH-04, FR-ADM-13
The admin opens the season for all vendors at once, with its own days, capacity, cuts and delivery methods, mandatory prepayment and an isolated cart.

### ADH-API-1 — Season configuration & Adha rules
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-ADH-01, FR-ADH-02, FR-ADH-03, FR-ADH-04, FR-ADM-13 · depends: SCH-API-2, CRT-API-1, PAY-API-1`

**What:** a season mode on top of the normal scheduling.

**Output:**
- `AdhaSeason` (year, isActive, lastBookingDate, days [{date, carcassCapacity, allowedCutIds[], methods delivery|pickup|both}]), admin `GET/PUT /v1/admin/adha-season`, activate/deactivate (audited), public `GET /v1/public/adha-season`
- Products with `orderType=adha` are only purchasable while the season is active and before `lastBookingDate`
- `SchedulingService` returns **season days only** for carts with Adha items (per-day capacity counted per vendor, cuts and methods validated)
- Cart isolation: mixing Adha and regular items → `ADHA_CART_ISOLATED`; payment methods for Adha carts exclude COD (mandatory prepayment)
- Season-specific cancellation rule setting (`adha.cancelUntilHoursBefore`)

**Where:** `services/api/src/modules/adha/`, `services/api/src/modules/scheduling/`, `services/api/src/modules/cart/`

**Acceptance:**
- [ ] Scheduling unit tests extended for season days, per-day capacity and disallowed cuts
- [ ] e2e: Adha + regular item → 409; COD not offered for Adha carts

### ADH-DSH-1 — Dashboard: Adha season settings & daily board
`type: Feature · area: dashboard · size: M · prio: P0 · reqs: FR-ADH-01, FR-ADH-02, FR-ADH-03, FR-ADM-13 · depends: ADH-API-1`

**What:** admins run the season.

**Output:** `/admin/adha`: season form (days with capacity, allowed cuts, methods; last booking date), a big activate switch with confirmation, a live board of bookings per day × vendor vs capacity, an export of each day's slaughter list per vendor (CSV/PDF)

**Where:** `apps/dashboard/src/app/[locale]/admin/adha`

**Acceptance:**
- [ ] Activating the season shows the Adha section in the app within one minute

### ADH-MOB-1 — Mobile: Adha season flow
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-ADH-01, FR-ADH-03, FR-ADH-04 · depends: ADH-API-1, ADH-DSH-1, PAY-MOB-1, OCC-DES-1`

**What:** customers book their أضحية.

**Output:** a season banner and section shown only when active; Adha products; a day picker limited to season days with remaining capacity; cuts limited per day; prepayment only; a clear message when trying to mix with a regular cart

**Where:** `apps/mobile/lib/features/adha/`

**Acceptance:**
- [ ] Deactivating the season hides the section and blocks checkout

## EPIC SVC — Special services on the web & QA
- reqs: FR-OCC-01, FR-VIS-01, FR-KIT-01, FR-ADH-01
Website versions of the four services and an end-to-end test pass across them.

### SVC-WEB-1 — Web: occasions, visits, cooked dishes & Adha
`type: Feature · area: web · size: XL · prio: P0 · reqs: FR-OCC-01, FR-OCC-02, FR-OCC-03, FR-KIT-01, FR-KIT-02, FR-ADH-01, FR-ADH-03, FR-ADH-04 · depends: OCC-API-2, KIT-API-2, ADH-API-1, ORD-WEB-1`

**What:** occasions, cooked dishes and Adha on the website, mirroring mobile behaviour. Visits on the web are VIS-WEB-1 (Sprint 6).

**Output:** `/[locale]/occasions` (wizard, request detail, quote accept, deposit/balance payment), cooked dishes category and "cook it for me" on product pages, `/[locale]/adha` season landing with a day picker and prepayment; SEO landing content for occasions and Adha

**Where:** `apps/web/src/app/[locale]/(services)/`, `apps/web/src/features/{occasions,visits,cooking,adha}/`

**Acceptance:**
- [ ] Playwright: occasion request + deposit and Adha booking on staging

### SVC-QA-1 — Special services test plan & e2e suite
`type: Task · area: qa · size: M · prio: P0 · reqs: FR-OCC-03, FR-KIT-03, FR-ADH-02 · depends: OCC-API-2, KIT-API-2, ADH-API-1`

**What:** these flows mix payments, capacity and multiple actors, so test them as complete journeys.

**Output:** (the visits journey is added by VIS-API-3 in Sprint 6) `docs/qa/special-services-test-plan.md` (journeys with expected money and status at each step) + API e2e journeys in `services/api/test/journeys/` (occasion with deposit and balance, cooking with auto-assignment and kitchen pickup, Adha booking at capacity)

**Where:** `docs/qa/`, `services/api/test/journeys/`

**Acceptance:**
- [ ] All journeys pass in CI on a fresh DB

## EPIC HRD — Hardening & launch
- reqs: NFR-HST, NFR-AVL
Production is provisioned early (this sprint) because the ZATCA production certificate, Apple Pay domain verification, gateway live checks and store review all need real production domains.

### HRD-INF-1 — Production environment, domains & CDN
`type: Task · area: infra · size: L · prio: P0 · reqs: NFR-HST, NFR-AVL, NFR-SEC · depends: FND-INF-5`

**What:** production that mirrors staging, sized for launch. It's provisioned in Sprint 5 so live-provider onboarding (ZATCA, Apple Pay, gateway, delivery company) can run in parallel with feature work. Deploys stay manual and tag-gated until v1.0.0.

**Output:** production DB (PostGIS, HA or a standby where the provider offers it), Redis, buckets (public through a CDN for product images; private documents), API with ≥ 2 instances behind the load balancer, web and dashboard; domains (`api.`, root/`www`, `admin.`) with TLS; a WAF/rate limiting at the edge if available; GitHub Environment `production` with required reviewers; `deploy-production.yml` triggered by tags `v*` on `main` (migrations first, health-check gated, automatic rollback on failure)

**Where:** `infra/deploy/production/`, `.github/workflows/deploy-production.yml`

**Acceptance:**
- [ ] A tag deploys to production with zero manual steps; a broken health check rolls back automatically

## EPIC REL — Releases & merge points

### REL-INF-5 — Release v0.5.0 (Sprint 5 merge point)
`type: Task · area: infra · size: XS · prio: P0 · depends: OCC-MOB-1, KIT-MOB-1, KIT-DSH-1, ADH-MOB-1, SVC-WEB-1, SVC-QA-1`

**What:** close Sprint 5.

**Output:** `release/v0.5.0` → `main`, tag, back-merge, mobile staging build shared with the client, STATUS.md updated

**Where:** git, `docs/delivery/STATUS.md`

**Acceptance:**
- [ ] Exit criteria demoed and ticked in the release PR
