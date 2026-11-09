# Sprint 3 — Cart, scheduling, checkout, payments & orders

> **Goal:** the core commerce loop end-to-end. A single-vendor cart with coupons, delivery or pickup on a valid day under admin-controlled rules, payment (fake provider → chosen gateway, COD, wallet), atomic order placement, real-time routing to the right dashboard, and order history.

**Release:** v0.3.0 (**first end-to-end order demo to the client**)

**Exit criteria (demo on staging):**
- Adding a product from a second vendor prompts "replace cart?". Below the minimum order, checkout is blocked and the remaining amount is shown.
- Changing the carcass cutoff in the dashboard immediately changes the first available day. Closed and full days are disabled, each with its reason. Pausing orders shows the admin's message.
- Payment (fake provider, or the gateway sandbox if PAY-API-2 landed) → order confirmed automatically → it appears instantly on the vendor dashboard. COD follows the confirmation setting.
- An unpaid order auto-cancels after 15 minutes and frees the capacity. A wallet balance (admin credit) pays part of an order.

**Merge points:**
- MP-1 (contracts, in order): SCH-API-1 → CRT-API-1 → SCH-API-2 (engine + `CapacityService`, interface frozen) → WAL-API-1 + PAY-API-1 → ORD-API-1 (incl. the reusable `OrdersService.createOrder`) → ORD-API-2. Every money-moving PR needs e2e tests on a fresh DB.
- MP-2: SCH-DSH-1 (operations settings) merges before the checkout client tasks. PAY-API-2 (real gateway, `needs-client`) is **not** a release gate: clients are built against the payment port, and the live SDK hookup is PAY-MOB-2 in Sprint 4.
- MP-4: REL-INF-3.

**Parallel tracks:** Backend: CRT/SCH/PAY/ORD/WAL-API · Mobile: CRT-MOB-1, SCH-MOB-1, ORD-MOB-*, PAY-MOB-1 · Web: CRT-WEB-1, SCH-WEB-1, ORD-WEB-* · Dashboard: CRT-DSH-1, SCH-DSH-1, ORD-DSH-1 · QA: SCH-QA-1

## EPIC CRT — Cart & coupons
- reqs: FR-CRT-01, FR-CRT-02, FR-CRT-03, FR-CRT-04, FR-ADM-09
Server-side single-vendor cart, guest cart merge, minimum order, and the coupon engine.

### CRT-API-1 — Cart service (single-vendor rule, totals, guest merge)
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-CRT-01, FR-CRT-03, FR-CRT-02 · depends: CAT-API-1, ACC-API-1, SCH-API-1`

**What:** the customer's cart, stored on the server.

This task also covers:
- **Guest cart merge on login:** a cart built as a guest moves to the account after login.

**Output:**

*Cart service (single-vendor rule, totals)*
- `Cart` (userId unique, vendorId?, couponId?, fulfilment?, addressId?, deliveryDate?) and `CartItem` (productId, sizeId, cutId?, packagingId?, exclusionIds[], notes, quantity, unitPriceSnapshot)
- `GET /v1/customer/cart`, `POST /v1/customer/cart/items` (`replace=true` to switch vendor), `PATCH/DELETE /v1/customer/cart/items/:id`, `DELETE /v1/customer/cart`
- Totals on every response: `subtotal, discount, deliveryFee, total, vatIncluded, minOrder, minOrderRemaining, canCheckout, issues[]`

*Guest cart merge on login*
- `POST /v1/customer/cart/merge` `{items[]}`

**How:**

*Cart service (single-vendor rule, totals)*
- Adding from another vendor without `replace` → 409 `CART_VENDOR_MISMATCH` with the current vendor's name.
- Every read re-prices through `PricingService` and returns `issues[]` for unavailable items or changed prices. Unavailable items are kept but block checkout.
- `minOrder` and `deliveryFee` come from the operations settings (SCH-API-1). The delivery fee is only shown once fulfilment = delivery.

*Guest cart merge on login*
- if the server cart is empty, or from the same vendor, merge lines (same configuration → sum quantities). If the vendors differ, the guest cart wins, because it's what the user just built, and the response flags `replacedPreviousCart=true`. Invalid lines are skipped and reported.

**Where:** `services/api/src/modules/cart/`

**Acceptance:**
- [ ] e2e: vendor mismatch → 409; with `replace=true` → cart replaced
- [ ] e2e: price change after add is reflected and flagged in `issues`
- [ ] Unit tests for all three merge cases

### CRT-API-3 — Coupon engine & admin coupon endpoints
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-CRT-04, FR-ADM-09 · depends: CRT-API-1`

**What:** discount codes with conditions.

**Output:**
- `Coupon` (code unique case-insensitive, type percent|fixed, value, maxDiscountHalalas?, minOrderHalalas?, vendorIds[]?, categoryIds[]?, startsAt, endsAt, usageLimit?, perUserLimit?, isActive, firstOrderOnly=false) and `CouponRedemption` (couponId, userId, orderId, amount)
- `POST /v1/customer/cart/coupon {code}`, `DELETE /v1/customer/cart/coupon`; `/v1/admin/coupons` CRUD + usage stats; audited
- `CouponService.validate(cart, user)` and `redeem(tx, order)` (called by ORD-API-1 inside the order transaction, with a row lock to respect limits under concurrency)

**How:** a scoped coupon discounts only the eligible lines. Error codes: `COUPON_NOT_FOUND`, `COUPON_EXPIRED`, `COUPON_MIN_ORDER`, `COUPON_NOT_APPLICABLE`, `COUPON_LIMIT_REACHED`. One coupon per order. The first-order discount stays **off** for now (decision 25), but the flag exists.

**Where:** `services/api/src/modules/coupons/`

**Acceptance:**
- [ ] Unit tests for every rule and error code
- [ ] Concurrency test: usageLimit=1 with 2 parallel redemptions → exactly one succeeds

### CRT-DSH-1 — Dashboard: coupons management
`type: Feature · area: dashboard · size: S · prio: P0 · reqs: FR-ADM-09, FR-CRT-04 · depends: CRT-API-3`

**What:** admins create and track coupons.

**Output:** `/admin/marketing/coupons`: table (status, usage), form with all conditions (vendor/category multi-select, dates, limits), deactivate

**Where:** `apps/dashboard/src/app/[locale]/admin/marketing/coupons`

**Acceptance:**
- [ ] A coupon created in the UI applies in the app cart

### CRT-MOB-1 — Mobile: cart
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-CRT-01, FR-CRT-02, FR-CRT-03, FR-CRT-04 · depends: CRT-API-1, CRT-API-3, STF-MOB-3`

**What:** the cart experience.

**Output:** `features/cart`: local guest cart (persisted), add-to-cart from product detail, vendor-switch dialog, line edit/remove, issues banners (unavailable / price changed), minimum-order progress bar, coupon field with error messages, totals, merge on login, cart badge in navigation

**Where:** `apps/mobile/lib/features/cart/`

**Acceptance:**
- [ ] Guest adds 2 items → logs in → items are in the server cart
- [ ] Checkout button is disabled below the minimum order with the remaining amount shown

### CRT-WEB-1 — Web: cart
`type: Feature · area: web · size: M · prio: P0 · reqs: FR-CRT-01, FR-CRT-02, FR-CRT-03, FR-CRT-04 · depends: CRT-API-1, CRT-API-3, STF-WEB-2`

**What:** the cart on the website.

**Output:** cart drawer + `/[locale]/cart` page with the same behaviours as mobile, guest cart in `localStorage`, merge on login

**Where:** `apps/web/src/app/[locale]/(shop)/cart`, `apps/web/src/features/cart/`

**Acceptance:**
- [ ] Playwright: add → vendor switch dialog → apply coupon

## EPIC SCH — Fulfilment, scheduling & operations settings
- reqs: FR-SCH-01, FR-SCH-02, FR-SCH-03, FR-SCH-04, FR-SCH-05, FR-SCH-06, FR-SCH-07, FR-ADM-05
Delivery vs pickup, one daily delivery window, cutoffs per order type in Riyadh time, booking horizon, closed days, daily capacity and the pause switch.

### SCH-DES-1 — Screens: fulfilment & day selection, operations settings
`type: Task · area: design · size: S · prio: P0 · reqs: FR-SCH-01, FR-SCH-02, FR-SCH-05, FR-SCH-07, FR-ADM-05 · depends: DSN-DES-1`

**What:** checkout step 1 and the admin operations screen.

**Output:** delivery/pickup toggle, address picker (covered only), pickup info card, day picker with disabled days and reasons, window display, paused banner; admin operations settings page (grouped sections, closed-days calendar, prominent pause switch)

**Where:** Figma (link in the issue)

**Acceptance:**
- [ ] Each disabled-day reason has its own copy (closed, full, past cutoff)

### SCH-API-1 — Operations settings API
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-ADM-05, FR-SCH-02, FR-SCH-03, FR-SCH-04, FR-SCH-05, FR-SCH-06, FR-SCH-07, FR-PAY-02 · depends: FND-API-4`

**What:** every operating rule, editable by the admin without a deploy.

**Output:** setting keys with zod schemas and seeded defaults:
- `ops.deliveryWindow {start:"16:00", end:"22:00"}`
- `ops.cutoffs {ready_meat:{time:"12:00", leadDays:0}, carcass:{time:"20:00", leadDays:1}, cooked:{time:"18:00", leadDays:1}, occasion:{leadDays:3}, adha:{…}}`
- `ops.bookingHorizonDays 14`
- `ops.closedDays [{date, scope: delivery|pickup|both, reasonAr, reasonEn}]`
- `ops.capacity {ordersPerDay, carcassesPerDay}` (platform default, per vendor)
- `ops.minOrderHalalas`, `ops.deliveryFeeHalalas`
- `ops.cod {enabled, maxOrderHalalas?, allowedOrderTypes[], confirmation: auto|review}`
- `ops.paused {isPaused, messageAr, messageEn}`
- `ops.complaintWindowHours 48`

Endpoints: `GET/PUT /v1/admin/settings/operations` (audited), `GET /v1/public/settings/client` (safe subset: window, minOrder, deliveryFee, paused, COD enabled, support phone/WhatsApp)

**How:** defaults are placeholders until the client sends operating numbers (`needs-client` on the epic is not required, because these are editable). Validate that end > start, leadDays ≥ 0, and that closed days are not in the past.

**Where:** `services/api/src/modules/settings/operations/`

**Acceptance:**
- [ ] e2e: invalid window rejected; change visible on the public endpoint within one request (cache invalidated)

### SCH-API-2 — Scheduling engine, capacity reservation, fulfilment rules & pause
`type: Feature · area: api · size: XL · prio: P0 · reqs: FR-SCH-02, FR-SCH-03, FR-SCH-04, FR-SCH-05, FR-SCH-06, FR-SCH-01, FR-SCH-07, FR-PRD-07 · depends: SCH-API-1, CAT-API-1, CRT-API-1`

**What:** the single source of truth for which days a customer can choose.

This task also covers:
- **Fulfilment rules & pause enforcement:** enforce the method rules and the pause switch across cart and checkout.

**Output:**

*Scheduling engine & capacity reservation*
- `SchedulingService.availableDays({vendorId, method, orderTypes[], carcassCount, now})` → `[{date, available, reason?: PAST_CUTOFF|CLOSED|FULL|OUTSIDE_HORIZON|VENDOR_CLOSED, window}]`
- `GET /v1/customer/checkout/days?method=delivery|pickup` (uses the caller's cart)
- `DayCapacity` table (vendorId, date, ordersBooked, carcassesBooked, ordersLimit?, carcassesLimit?) for per-vendor overrides
- `CapacityService.reserve(tx, {vendorId, date, carcasses})` and `release(tx, …)` with an **atomic conditional update**: `INSERT … ON CONFLICT DO NOTHING` to create the day row, then `UPDATE day_capacity SET booked = booked + n WHERE … AND booked + n <= limit` and check the affected row count. It throws `DAY_FULL`. No `SELECT … FOR UPDATE` on rows that may not exist

*Fulfilment rules & pause enforcement*
- `PATCH /v1/customer/cart/fulfilment {method, addressId?, date}`, validated: every cart item supports the method, address is covered (delivery), vendor has pickup enabled (pickup), date is available; pickup info (vendor address, map point, hours, instructions) in the cart response; when paused, every cart mutation and checkout returns `ORDERING_PAUSED` with the localized message

**How:**

*Scheduling engine & capacity reservation*
- All computation runs in `Asia/Riyadh` (use `@date-fns/tz`, no local server time).
- The earliest day = max over cart order types of (today + leadDays, plus one day if now > cutoff time).
- The horizon counts from today. Closed days are filtered by scope. Pickup days also respect the vendor's working hours (day-of-week).
- Capacity counts orders and carcasses (sum of carcass-type line quantities).
- Freeze the service interface in this PR, since ORD, OCC, KIT and ADH depend on it.

**Where:** `services/api/src/modules/scheduling/`, `services/api/src/modules/cart/`

**Acceptance:**
- [ ] Unit test matrix (≥ 25 cases) including 11:59 vs 12:01 Riyadh around cutoff, a mixed cart taking the strictest type, last horizon day, closed delivery-only day with pickup still open, capacity exactly at limit
- [ ] Concurrency test: two parallel reservations for the last slot → one `DAY_FULL`
- [ ] e2e: pickup-only product + delivery → `FULFILMENT_NOT_SUPPORTED`
- [ ] e2e: paused → cart add returns `ORDERING_PAUSED`

### SCH-DSH-1 — Dashboard: operations settings + per-vendor capacity
`type: Feature · area: dashboard · size: L · prio: P0 · reqs: FR-ADM-05, FR-SCH-02, FR-SCH-03, FR-SCH-04, FR-SCH-05, FR-SCH-06, FR-SCH-07 · depends: SCH-API-1, SCH-DES-1, SCH-API-2, VND-DSH-2`

**What:** admins control operations from one page.

This task also covers:
- **Dashboard: per-vendor capacity override:** admins set a different daily capacity for a specific vendor or date.

**Output:**

*Dashboard: operations settings*
- `/admin/settings/operations` with sections: delivery window, cutoffs per order type, booking horizon, closed days (calendar + list with scope and reason), daily capacity, minimum order and delivery fee, COD rules, complaint window; a separate always-visible **"Pause orders"** switch in the admin header with message inputs and a confirmation dialog

*Dashboard: per-vendor capacity override*
- capacity tab on the vendor detail page (default override + specific dates)

**Where:** `apps/dashboard/src/app/[locale]/admin/settings/operations`, `apps/dashboard/src/app/[locale]/admin/vendors/[id]`

**Acceptance:**
- [ ] Every field saves and validates with API error mapping
- [ ] The pause switch state is visible on every admin page
- [ ] Override is respected by `availableDays`

### SCH-MOB-1 — Mobile: checkout step 1 (method, address, day)
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-SCH-01, FR-SCH-02, FR-SCH-05, FR-SCH-07 · depends: SCH-API-2, ACC-MOB-3, CRT-MOB-1, SCH-DES-1`

**What:** choose how and when to receive the order.

**Output:** `features/checkout/fulfilment`: method toggle, covered address selection (add new inline), pickup card with map and directions, horizontal day picker with disabled days and reason tooltips, window text, paused banner

**Where:** `apps/mobile/lib/features/checkout/`

**Acceptance:**
- [ ] Days are refetched when the method or address changes
- [ ] Disabled days explain why

### SCH-WEB-1 — Web: checkout step 1 (method, address, day)
`type: Feature · area: web · size: M · prio: P0 · reqs: FR-SCH-01, FR-SCH-02, FR-SCH-05, FR-SCH-07 · depends: SCH-API-2, ACC-WEB-1, CRT-WEB-1, SCH-DES-1`

**What:** the same step on the website.

**Output:** `/[locale]/checkout` step 1 with the same behaviour as mobile

**Where:** `apps/web/src/app/[locale]/(shop)/checkout`

**Acceptance:**
- [ ] Playwright: pick delivery + first available day

### SCH-QA-1 — Scheduling test plan & e2e suite
`type: Task · area: qa · size: S · prio: P0 · reqs: FR-SCH-03, FR-SCH-05, FR-SCH-06, FR-SCH-07 · depends: SCH-API-2`

**What:** the scheduling rules are the riskiest logic, so document and automate them.

**Output:** `docs/qa/scheduling-test-plan.md` (case table: input time, cart types, settings → expected first day / reasons) + an API e2e suite `test/scheduling.e2e-spec.ts` that runs every case with frozen time

**Where:** `docs/qa/`, `services/api/test/`

**Acceptance:**
- [ ] Every case in the doc has a matching automated test

## EPIC PAY — Payments
- reqs: FR-PAY-01, FR-PAY-02, FR-PAY-03, NFR-SEC
Payment gateway behind a port, COD rules, wallet tender and refunds. No card data ever touches our servers (PCI-DSS stays with the gateway).

### PAY-DOC-1 — Spike: payment gateway selection (ADR-0004)
`type: Task · area: api · size: S · prio: P0 · reqs: FR-PAY-01 · labels: spike, needs-client`

**What:** help the client pick one gateway among Moyasar, Tap, HyperPay and PayTabs.

**Output:** `docs/adr/0004-payment-gateway.md`: fees (mada / credit / Apple Pay), settlement period, Apple Pay on iOS and web, tokenization, refunds API (full/partial), webhooks and signatures, Flutter SDK quality, sandbox availability, onboarding documents needed; recommendation

**Where:** `docs/adr/`

**Acceptance:**
- [ ] Client decision recorded; sandbox keys stored in GitHub Environments / secret manager

### PAY-API-1 — Payment port, webhooks, fake provider, COD rules & wallet tender
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-PAY-01, NFR-SEC, FR-PAY-02, FR-PAY-03 · depends: FND-API-4, WAL-API-1, SCH-API-1 · labels: security`

**What:** provider-agnostic payments.

This task also covers:
- **COD eligibility & wallet / split tender:** which payment methods a given order may use, and paying partly with the wallet.

**Output:**

*Payment port, model, webhooks & fake provider*
- `Payment` (orderId?, purpose order|occasion_deposit|occasion_balance|visit_fee|animal_deposit, provider, method mada|card|applepay|cod|wallet, amountHalalas, status initiated|authorized|captured|failed|cancelled|refunded|partially_refunded, providerRef, idempotencyKey, rawLast) and `Refund` (paymentId, amount, status, providerRef, reason)
- `integrations/payments/payment.port.ts`: `createIntent`, `getStatus`, `refund`, `verifyWebhook`, `parseWebhook`
- `providers/fake.ts` (dev/staging: approve/decline by amount or test card) and `POST /v1/webhooks/payments/:provider`
- `PaymentsService`: emits `payment.captured|failed|refunded`

*COD eligibility & wallet / split tender*
- `GET /v1/customer/checkout/payment-methods` → available methods with reasons (COD hidden if disabled, above the cap, or a disallowed order type such as Adha); a tender plan `{walletAmount, remainingMethod}`; wallet debit happens inside the order transaction and is reversed if the remaining payment fails or expires

**How:**

*Payment port, model, webhooks & fake provider*
- Process webhooks idempotently, keyed by provider event id (unique table), and queue them through BullMQ with retries.
- Never trust the client's redirect: confirm the status server-side through `getStatus` or the webhook.
- An idempotency key is required when creating payments.

**Where:** `services/api/src/integrations/payments/`, `services/api/src/modules/payments/`

**Acceptance:**
- [ ] e2e with the fake provider: capture → event emitted; duplicate webhook → processed once
- [ ] A webhook with a bad signature → 401 and an alert log
- [ ] e2e: wallet covers 100% → order confirmed without the gateway
- [ ] e2e: wallet partial + failed card → wallet amount restored

### PAY-API-2 — Gateway implementation (mada, cards, Apple Pay, 3DS, refunds)
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-PAY-01 · depends: PAY-API-1, PAY-DOC-1 · labels: needs-client, security`

**What:** the chosen gateway behind the port.

**Output:** `providers/<gateway>.ts` implementing every port method; 3DS redirect/callback URLs for app (deep link) and web; Apple Pay merchant validation endpoint (web) and token decryption flow per gateway docs; full and partial refunds; sandbox contract tests (`*.contract-spec.ts`, run manually or nightly)

**How:** follow the gateway's recommended mobile flow (native SDK or hosted page). Map gateway statuses to ours in one table in code.

**Where:** `services/api/src/integrations/payments/providers/`

**Acceptance:**
- [ ] Sandbox: mada success, card 3DS success/fail, Apple Pay success, full and partial refund
- [ ] Switching provider is config-only

### PAY-MOB-1 — Mobile: payment step
`type: Feature · area: mobile · size: L · prio: P0 · reqs: FR-PAY-01, FR-PAY-02, FR-PAY-03 · depends: PAY-API-1, ORD-MOB-1`

**What:** pay for an order in the app.

**Output:** `features/payment`: method list (Apple Pay on iOS via the `pay` package or gateway SDK, mada/card via the gateway SDK or hosted page in a webview, COD, wallet toggle with amount), 3DS handling, result screen (success → order detail; failure → retry or change method), handling app-kill during payment (on resume, re-check status)

**Where:** `apps/mobile/lib/features/payment/`

**Acceptance:**
- [ ] Works end-to-end against the fake provider; the live gateway SDK hookup is PAY-MOB-2
- [ ] Interrupting 3DS and reopening the app shows the correct final state

## EPIC ORD — Orders
- reqs: FR-ORD-01, FR-ORD-02, FR-ORD-03, FR-ORD-04, FR-LOC-03
Placing orders atomically, the order state machine, routing to the right dashboard, and order history.

### ORD-API-1 — Place order (atomic checkout)
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-ORD-01, FR-LOC-03, FR-CRT-03, FR-CRT-04 · depends: CRT-API-3, SCH-API-2, LOC-API-1, PAY-API-1, WAL-API-1`

**What:** turn a cart into an order safely.

**Output:**
- `Order` (number `JZ-YYMMDD-XXXX`, userId, vendorId, **orderType** ready_meat|carcass|cooked|occasion|adha|mixed (strictest type in the order), **commissionRateBps snapshot**, **discountVendorFunded / discountPlatformFunded**, status, fulfilment, addressSnapshot, pickupSnapshot, deliveryDate, window, subtotal, discount, deliveryFee, total, vatAmount, paymentMethod, couponId, notes, cancelReason?, timestamps) and `OrderItem` (product/size/options **snapshots** with names AR/EN and prices)
- `POST /v1/customer/orders` (header `Idempotency-Key`) → `{order, payment: {nextAction}}`
- `OrdersService.createOrder(tx, {userId, vendorId, lines, fulfilment, date, source: cart|occasion|animal, payments})`: the reusable core (re-price, capacity, coupon, snapshots, numbering) used by checkout and later by OCC-API-1 and VIS-API-2, so the logic is never duplicated

**How:** in one DB transaction:
1. lock the cart
2. re-check paused and minimum order
3. re-price every line
4. re-validate fulfilment and coverage (server-side, FR-LOC-03)
5. re-check the day and reserve capacity (`CapacityService.reserve`)
6. redeem the coupon (row lock)
7. debit the wallet if used
8. create the order (`pending_payment`, or `new` for COD/wallet-only) and items
9. clear the cart

Then call the payment intent outside the transaction. If it fails, the payment-timeout job undoes the order. Implement the `AddressUsagePort` and active-orders ports from ACC-API-2. Increment `salesCount` on confirmation.

**Where:** `services/api/src/modules/checkout/`, `services/api/src/modules/orders/`

**Acceptance:**
- [ ] e2e: same idempotency key twice → one order
- [ ] e2e: the address left coverage after being added to the cart → `ADDRESS_NOT_COVERED`
- [ ] e2e: capacity full between days fetch and placement → `DAY_FULL` and nothing persisted

### ORD-API-2 — Order state machine, confirmation rules & payment timeout
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-ORD-01, FR-ORD-03 · depends: ORD-API-1`

**What:** every order status change goes through one guarded state machine.

**Output:**
- Statuses: `pending_payment → new → confirmed → preparing → ready → picked_up → out_for_delivery → delivered`; pickup: `ready → collected`; exceptions: `cancelled`, `delivery_failed`, `returned`
- `OrderStatusHistory` (from, to, actorType system|customer|admin|vendor|kitchen|delivery, actorId, note, at)
- `OrdersService.transition(orderId, to, actor, meta)` with a transition table (allowed from→to and actor), emits `order.status.changed`
- Rules: payment captured → `confirmed`; COD → `confirmed` if `ops.cod.confirmation=auto`, else stays `new` for admin review; a job cancels `pending_payment` after 15 min (releases capacity, coupon and wallet)
- **Late capture:** a payment captured after the order was cancelled or expired → automatic full refund + admin alert (`payment.captured` listener checks the order state)

**How:** the transition table is data in code (`orders/state-machine.ts`) with exhaustive unit tests. No other module updates `order.status` directly.

**Where:** `services/api/src/modules/orders/`

**Acceptance:**
- [ ] Unit tests: every allowed and forbidden transition
- [ ] e2e: unpaid order cancelled by the job and capacity released
- [ ] e2e: a webhook capturing a payment for an expired order triggers a refund and an alert

### ORD-API-3 — Order routing, realtime events & order history endpoints
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-ORD-02, FR-ORD-04 · depends: ORD-API-2, FND-API-4`

**What:** each order shows up immediately where it must be handled.

This task also covers:
- **Customer order history & detail:** customers see their orders.

**Output:**

*Order routing to admin / vendor & realtime events*
- `GET /v1/vendor/orders` (own orders, filters: status, date, method) and `GET /v1/vendor/orders/:id`; `GET /v1/admin/orders` (all; Jazlah's own orders are handled here because Jazlah is the platform vendor); realtime `order.created` / `order.updated` to `vendor:{id}` and `admin:orders`; `POST /v1/vendor/orders/:id/transition` and `/v1/admin/orders/:id/transition` (actor-checked)

*Customer order history & detail*
- `GET /v1/customer/orders?scope=current|past`, `GET /v1/customer/orders/:id` (items, totals, payment, status timeline, `canCancel`, `canComplain`, tracking block filled in Sprint 4, invoice link filled in Sprint 6); realtime `order.updated` to `user:{id}`

**Where:** `services/api/src/modules/orders/controllers/`, `services/api/src/modules/orders/controllers/customer.controller.ts`

**Acceptance:**
- [ ] e2e: vendor A can't see vendor B's orders
- [ ] Socket test: placing an order emits to the vendor room within 1 s
- [ ] e2e: a customer can only fetch their own orders

### ORD-MOB-1 — Mobile: review & place order
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-ORD-01 · depends: ORD-API-1, SCH-MOB-1`

**What:** final checkout step before payment.

**Output:** `features/checkout/review`: items summary, fulfilment summary, notes, coupon, totals, terms acceptance, "Place order" → creates the order with an idempotency key → payment step; handles `DAY_FULL` / `ADDRESS_NOT_COVERED` / `PRICE_CHANGED` by sending the user back to the right step

**Where:** `apps/mobile/lib/features/checkout/`

**Acceptance:**
- [ ] Double-tapping "Place order" creates one order

### ORD-MOB-2 — Mobile: my orders & order detail
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-ORD-03, FR-ORD-04 · depends: ORD-API-3`

**What:** follow orders.

**Output:** `features/orders`: current/past tabs, order detail with status timeline (live via socket, polling fallback), items and options, totals, payment info, pickup details, support button; slots reserved for tracking and freshness (Sprint 4), invoice and rating (Sprint 6)

**Where:** `apps/mobile/lib/features/orders/`

**Acceptance:**
- [ ] A status change from the dashboard updates the open detail screen without refresh

### ORD-WEB-1 — Web: review, place order & pay
`type: Feature · area: web · size: L · prio: P0 · reqs: FR-ORD-01, FR-PAY-01, FR-PAY-02, FR-PAY-03 · depends: ORD-API-1, SCH-WEB-1, PAY-API-1`

**What:** final checkout step on the website.

This task also covers:
- **Web: payment step:** pay on the website.

**Output:**

*Web: review & place order*
- checkout review step with the same behaviour and error handling as mobile

*Web: payment step*
- payment step with the gateway's hosted fields/form, Apple Pay on Safari (domain association file served from `/.well-known/`), return URL page that polls the order status

**Where:** `apps/web/src/app/[locale]/(shop)/checkout`, `apps/web/src/app/[locale]/(shop)/checkout/payment`, `apps/web/public/.well-known/`

**Acceptance:**
- [ ] Playwright: full checkout with COD on staging
- [ ] Sandbox card payment works; refreshing on the return page is safe

### ORD-WEB-2 — Web: my orders & order detail
`type: Feature · area: web · size: M · prio: P0 · reqs: FR-ORD-03, FR-ORD-04 · depends: ORD-API-3`

**What:** order history on the website.

**Output:** `/[locale]/orders` and `/[locale]/orders/[id]` with a live timeline

**Where:** `apps/web/src/app/[locale]/(account)/orders`

**Acceptance:**
- [ ] Live update works with the socket client

### ORD-DSH-1 — Dashboard: basic orders board (admin & vendor)
`type: Feature · area: dashboard · size: M · prio: P0 · reqs: FR-ORD-02, FR-ORD-03 · depends: ORD-API-3`

**What:** a working orders list for both roles so the end-to-end flow can be tested. Sprint 4 extends both the vendor side (VOP-DSH-1) and the admin side (ADM-DSH-2).

**Output:** `/vendor/orders` and `/admin/orders`: table with status filter and realtime insert, order detail drawer (items, options, customer contact, address map, notes), transition buttons allowed by the state machine, COD review action (confirm or reject) for admins

**Where:** `apps/dashboard/src/features/orders/`, `apps/dashboard/src/app/[locale]/{admin,vendor}/orders`

**Acceptance:**
- [ ] A new order appears without refresh; transitions update the customer app

## EPIC WAL — Wallet
- reqs: FR-WAL-01, FR-WAL-02, FR-PAY-03
Customer wallet with an append-only ledger, used for refunds, compensation and payment.

### WAL-API-1 — Wallet ledger, endpoints & admin adjustments
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-WAL-01, FR-WAL-02 · depends: ACC-API-1`

**What:** a safe balance that can never go negative or double-count.

This task also covers:
- **Wallet endpoints & admin adjustments:** read the wallet; admins add or deduct with a reason.

**Output:**

*Wallet ledger service*
- `Wallet` (userId, balanceHalalas cached) and `WalletTransaction` (walletId, type credit|debit, reason refund|compensation|cashback|order_payment|admin_adjust|reversal, amount, balanceAfter, refType, refId, unique (refType, refId) where refId is the specific source record, e.g. `Refund.id`, `Payment.id` or `Adjustment.id`, never the order id); `WalletService.credit(tx, …)` / `debit(tx, …)` with a row lock, idempotent by reference

*Wallet endpoints & admin adjustments*
- `GET /v1/customer/wallet` (balance + paged transactions), `POST /v1/admin/customers/:id/wallet/adjust {type, amount, reason}` (audited, permission `customers.manage`)

**Where:** `services/api/src/modules/wallet/`

**Acceptance:**
- [ ] Unit/concurrency tests: parallel debits never overdraw; the same reference twice is applied once
- [ ] `balance == sum(transactions)` holds in a consistency test
- [ ] e2e: an adjustment without a reason → 400

## EPIC REL — Releases & merge points
Sprint-end merge points. Each task cuts a release branch, verifies the sprint's exit criteria on staging, merges to `main`, tags, back-merges to `develop` and updates STATUS.md.

### REL-INF-3 — Release v0.3.0 (Sprint 3 merge point, first end-to-end order demo)
`type: Task · area: infra · size: XS · prio: P0 · depends: CRT-MOB-1, CRT-WEB-1, CRT-DSH-1, SCH-DSH-1, SCH-MOB-1, SCH-WEB-1, SCH-QA-1, PAY-MOB-1, ORD-WEB-1, ORD-MOB-2, ORD-WEB-2, ORD-DSH-1`

**What:** close Sprint 3 and demo a full order to the client.

**Output:** `release/v0.3.0` → `main`, tag, back-merge, mobile staging build shared with the client, STATUS.md updated

**How:** run this sprint's exit criteria on staging; capture client feedback as issues.

**Where:** git, `docs/delivery/STATUS.md`

**Acceptance:**
- [ ] Exit criteria demoed and ticked in the release PR
- [ ] Client feedback from the demo captured as issues

