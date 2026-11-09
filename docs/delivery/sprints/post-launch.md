# Post-launch — Phase 2 features

> **Goal:** the features agreed for after launch (SRS phase "بعد الإطلاق"). The client prioritizes them after launch. Each epic is independent and can be scheduled into v1.x sprints in any order.

**Release:** v1.x (one minor release per batch)

**Exit criteria:** defined per epic when the client schedules it.

**Merge points:** same rules as the launch sprints. Each epic's API task merges first, behind a feature flag (`features.<name>` setting) so it can ship dark and be switched on from the dashboard.

## EPIC LOY — Loyalty points & engagement
- reqs: FR-LOY-01, FR-LOY-02, FR-LOY-03, FR-LOY-04, FR-ADM-13, FR-PRD-01
Platform-wide points earned on completed orders and actions, redeemable at checkout.

### LOY-API-1 — Points ledger, earning, redemption & expiry
`type: Feature · area: api · size: L · prio: P1 · reqs: FR-LOY-01, FR-LOY-02, FR-LOY-03, FR-LOY-04, FR-ADM-13 · depends: ORD-API-2, PAY-API-1`

**What:** a points system that works like the wallet ledger.

**Output:** `PointsTransaction` (userId, type earn|redeem|expire|bonus|reversal, points, refType, refId, expiresAt); earning on delivered/collected at `loyalty.pointsPerRiyal`; bonus actions (story published, rating, referral) from settings; redemption at checkout (minimum points, value per point, max % of order) inside the order transaction; nightly expiry job; reversal on refund; `GET /v1/customer/points`; settings in the admin; `pointsToEarn` on the product detail (FR-PRD-01)

**Where:** `services/api/src/modules/loyalty/`

**Acceptance:**
- [ ] Ledger consistency and concurrency tests, as for the wallet

### LOY-MOB-1 — Mobile, web & dashboard: points experience and settings
`type: Feature · area: mobile · size: L · prio: P1 · reqs: FR-LOY-02, FR-LOY-03, FR-ADM-13 · depends: LOY-API-1`

**What:** customers see, earn and spend points; admins configure them.

**Output:** points screen (balance, history, expiring soon) and a redeem toggle in the mobile and web checkout, points-to-earn on product pages; a loyalty settings page in the dashboard (`/admin/settings/loyalty`)

**Where:** `apps/mobile/lib/features/loyalty/`, `apps/web/src/features/loyalty/`, `apps/dashboard/src/app/[locale]/admin/settings/loyalty`

**Acceptance:**
- [ ] Redeeming points updates the total identically on app and web

## EPIC STY — Stories
- reqs: FR-STR-01, FR-STR-02, FR-STR-03, FR-VND-07
Short image/video stories from customers (linked to their order), vendors and Jazlah, with moderation.

### STY-API-1 — Stories API & moderation
`type: Feature · area: api · size: M · prio: P1 · reqs: FR-STR-01, FR-STR-02, FR-STR-03 · depends: FND-API-4, ORD-API-2, ADM-API-1`

**What:** create, moderate and serve stories.

**Output:** `Story` (authorType customer|vendor|platform, authorId, orderId?, mediaId, caption, link target product|store, status pending|published|rejected, publishedAt, expiresAt); customer stories only for their own delivered orders; vendors and admins post; moderation mode setting (pre- or post-publication); visibility duration setting; `GET /v1/public/stories` grouped by author; view counts; loyalty bonus event

**Where:** `services/api/src/modules/stories/`

**Acceptance:**
- [ ] Expired and rejected stories never appear publicly

### STY-MOB-1 — Mobile & dashboard: stories bar, viewer, posting & moderation
`type: Feature · area: mobile · size: L · prio: P1 · reqs: FR-STR-01, FR-STR-02, FR-STR-03 · depends: STY-API-1`

**What:** the stories experience.

**Output:** a stories bar on home (the slot reserved in STF-MOB-1), a full-screen viewer (tap/hold/swipe, link to product/store), posting from a delivered order (camera/gallery, trim video ≤ 30 s); dashboard: vendor "post story" and the admin moderation queue + settings

**Where:** `apps/mobile/lib/features/stories/`, `apps/dashboard/src/app/[locale]/{admin,vendor}/stories`

**Acceptance:**
- [ ] The viewer works smoothly with 20 stories, preloading the next one

## EPIC CHR — Sahm Al-Khair (charity shares)
- reqs: FR-CHR-01, FR-CHR-02, FR-CHR-03
Customers buy a share in a charity sacrifice managed by Jazlah. They get notified with proof when it's carried out.

### CHR-API-1 — Charity sacrifices, shares & reporting
`type: Feature · area: api · size: M · prio: P1 · reqs: FR-CHR-01, FR-CHR-02, FR-CHR-03 · depends: PAY-API-2, NOT-API-1`

**What:** sell shares and close them out.

**Output:** `CharitySacrifice` (type e.g. camel 7 shares, totalShares, priceHalalasPerShare, status open|full|executed, executedAt, proofMediaIds[]), `CharityShare` (userId, sacrificeId, shares, paymentId, onBehalfOf?); share purchase through payments; auto-close when full and open the next one; an admin "mark executed" with proof → notifies all contributors; an admin report of contributions and executions

**Where:** `services/api/src/modules/charity/`

**Acceptance:**
- [ ] Concurrent purchases never oversell the last shares

### CHR-MOB-1 — Mobile, web & dashboard: Sahm Al-Khair
`type: Feature · area: mobile · size: M · prio: P1 · reqs: FR-CHR-01, FR-CHR-02, FR-CHR-03 · depends: CHR-API-1`

**What:** contribute and follow.

**Output:** a Sahm Al-Khair section (remaining shares progress, buy shares, on-behalf-of name), my contributions with proof when executed (app + web); dashboard sacrifices management, execution with proof upload, reports

**Where:** `apps/mobile/lib/features/charity/`, `apps/web/src/features/charity/`, `apps/dashboard/src/app/[locale]/admin/charity`

**Acceptance:**
- [ ] Contributors get the execution notification with media

## EPIC BNPL — Installments (Tamara / Tabby)
- reqs: FR-PAY-04
Buy now, pay later through the provider the client chooses.

### BNPL-API-1 — BNPL provider integration
`type: Feature · area: api · size: L · prio: P2 · reqs: FR-PAY-04 · depends: PAY-API-2 · labels: needs-client`

**What:** add installments as a payment method.

**Output:** `integrations/bnpl/` port + provider (Tamara or Tabby): eligibility/pre-scoring, checkout session, webhooks (authorized, captured, cancelled), capture on delivery, refunds; a method shown only within the provider's min/max amounts and allowed order types; promo widget data for product pages

**Where:** `services/api/src/integrations/bnpl/`

**Acceptance:**
- [ ] Sandbox: approve → capture on delivery → refund

### BNPL-MOB-1 — Mobile & web: installments at checkout
`type: Feature · area: mobile · size: M · prio: P2 · reqs: FR-PAY-04 · depends: BNPL-API-1`

**What:** customers pick installments.

**Output:** the BNPL method in the mobile and web payment steps (provider webview/redirect), installment promo snippets on product pages

**Where:** `apps/mobile/lib/features/payment/`, `apps/web/src/app/[locale]/(shop)/checkout/payment`

**Acceptance:**
- [ ] Hidden outside the eligible amount range

## EPIC MSL — Multiple delivery slots per day
- reqs: FR-SCH-08
Several delivery windows a day, each with its own capacity.

### MSL-API-1 — Multi-slot scheduling
`type: Feature · area: api · size: L · prio: P1 · reqs: FR-SCH-08 · depends: SCH-API-2`

**What:** extend the scheduling engine from one window to many.

**Output:** setting `ops.deliverySlots [{id, start, end, cutoffOffsetMinutes, capacityOrders, capacityCarcasses}]` (falls back to the single window); `availableDays` returns slots per day with availability and reasons; capacity counted per slot; order stores `slotId`; migration keeps existing orders on the default slot

**Where:** `services/api/src/modules/scheduling/`

**Acceptance:**
- [ ] The full SCH-QA-1 suite still passes plus new per-slot cases

### MSL-MOB-1 — Mobile, web & dashboard: slot selection & settings
`type: Feature · area: mobile · size: M · prio: P1 · reqs: FR-SCH-08 · depends: MSL-API-1`

**What:** choose a time slot after the day.

**Output:** a slot picker under the day picker (app + web); a slots editor in the operations settings (dashboard); the slot shown on vendor/admin boards and labels

**Where:** `apps/mobile/lib/features/checkout/`, `apps/web/src/app/[locale]/(shop)/checkout`, `apps/dashboard/src/app/[locale]/admin/settings/operations`

**Acceptance:**
- [ ] Full slots are disabled with a reason

## EPIC RGF — Reorder, gifting & favorites
- reqs: FR-ORD-06, FR-ORD-07, FR-CAT-04
Quality-of-life features for repeat customers.

### RGF-API-1 — Reorder, gift orders & favorites API
`type: Feature · area: api · size: M · prio: P1 · reqs: FR-ORD-06, FR-ORD-07, FR-CAT-04 · depends: ORD-API-1`

**What:** three small backend features.

**Output:** `POST /v1/customer/orders/:id/reorder` → refills the cart from snapshots and reports unavailable or changed items; gift orders (`isGift`, recipient name and phone, gift message, hide prices on the label; notify the recipient by SMS on dispatch); `Favorite` (userId, productId) with toggle and list endpoints

**Where:** `services/api/src/modules/{orders,cart,favorites}/`

**Acceptance:**
- [ ] Reorder with an unavailable item returns it in `issues`, and the rest is added

### RGF-MOB-1 — Mobile & web: reorder, gift & favorites
`type: Feature · area: mobile · size: M · prio: P1 · reqs: FR-ORD-06, FR-ORD-07, FR-CAT-04 · depends: RGF-API-1`

**What:** the customer side of these features.

**Output:** "Order again" on past orders, a gift toggle + recipient form at checkout, a heart on products + a favorites screen (app + web)

**Where:** `apps/mobile/lib/features/{orders,checkout,favorites}/`, `apps/web/src/features/{favorites}/`

**Acceptance:**
- [ ] A gift order's label hides the prices

## EPIC VRF — Verified vendor badge & seasonal theme
- reqs: FR-FRS-03, FR-ADH-05
Trust and seasonal polish.

### VRF-API-1 — Verified badge rules & seasonal theme flag
`type: Feature · area: api · size: S · prio: P2 · reqs: FR-FRS-03, FR-ADH-05 · depends: VOP-API-1, ADH-API-1`

**What:** compute the verified badge; expose the seasonal theme.

**Output:** a nightly job computing each vendor's freshness-documentation rate over the last N orders → `isVerified` when ≥ `freshness.verifiedThresholdPct`; `theme.seasonal` setting (auto on while the Adha season is active, or manual) in the public client settings

**Where:** `services/api/src/modules/freshness/`, `services/api/src/modules/settings/`

**Acceptance:**
- [ ] The badge appears and disappears according to the threshold

### VRF-MOB-1 — Mobile, web & dashboard: badge display & seasonal theme
`type: Feature · area: mobile · size: M · prio: P2 · reqs: FR-FRS-03, FR-ADH-05 · depends: VRF-API-1`

**What:** show the badge and switch the seasonal look.

**Output:** a verified badge on store cards and pages (app + web); a seasonal theme variant (colors, home header art) switched by the flag; dashboard settings for the threshold and the theme toggle

**Where:** `apps/mobile/lib/app/theme/`, `apps/web/src/`, `apps/dashboard/src/app/[locale]/admin/settings`

**Acceptance:**
- [ ] The theme switches without an app update

## EPIC FTX — Paid feed transactions
- reqs: FR-FED-07
Buying feed inside the platform with payment, delivery and commission.

### FTX-API-1 — Feed orders, payment, delivery & commission
`type: Feature · area: api · size: XL · prio: P2 · reqs: FR-FED-07 · depends: FED-API-1, PAY-API-2, DLV-API-1, FIN-API-1`

**What:** turn a listing into a paid order.

**Output:** `FeedOrder` (listingId, buyerId, sellerId, quantity, unitPrice, deliveryOption, total, commission, status), checkout + payment, seller confirmation, a delivery shipment (or seller delivery), feed seller ledger and payouts reusing FIN, a dispute flow

**Where:** `services/api/src/modules/feed-orders/`

**Acceptance:**
- [ ] End-to-end paid feed order with commission settled in the seller payout

### FTX-MOB-1 — Mobile & dashboard: feed checkout & seller orders
`type: Feature · area: mobile · size: L · prio: P2 · reqs: FR-FED-07 · depends: FTX-API-1`

**What:** buy feed in the app; manage feed orders.

**Output:** "Buy now" on listings with quantity and delivery choice, feed order tracking; seller order management in the app; admin feed orders and disputes in the dashboard

**Where:** `apps/mobile/lib/features/feed/`, `apps/dashboard/src/app/[locale]/admin/feed`

**Acceptance:**
- [ ] Seller and buyer both see consistent order states

## EPIC VST — Vendor staff accounts
- reqs: FR-VND-07
Vendors add employees with limited permissions.

### VST-API-1 — Vendor staff & permissions
`type: Feature · area: api · size: M · prio: P1 · reqs: FR-VND-07 · depends: ADM-API-1, VND-API-2`

**What:** sub-accounts under a vendor.

**Output:** role `vendor_staff` with vendor permissions (`orders.manage`, `products.manage`, `visits.manage`, `earnings.view`, `stories.post`); owner invites staff by phone; guards on every `/v1/vendor/*` route; actions attributed to the staff member in the audit log

**Where:** `services/api/src/modules/vendors/staff/`

**Acceptance:**
- [ ] Staff without `earnings.view` gets 403 on earnings

### VST-DSH-1 — Dashboard: vendor staff management
`type: Feature · area: dashboard · size: S · prio: P1 · reqs: FR-VND-07 · depends: VST-API-1`

**What:** the vendor owner manages the team.

**Output:** `/vendor/staff` (invite, permissions checklist, deactivate) and a permission-aware vendor sidebar

**Where:** `apps/dashboard/src/app/[locale]/vendor/staff`

**Acceptance:**
- [ ] The staff member only sees the allowed menus
