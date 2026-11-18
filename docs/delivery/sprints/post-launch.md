# Post-launch — Phase 2 features

> **No customer website (2026-11-18):** where a task below still says "web" or `apps/web`, that part is out of scope.

> **Goal:** the features agreed for after launch (SRS phase "بعد الإطلاق"). The client prioritizes them after launch. Each epic is independent and can be scheduled into v1.x sprints in any order.

**Release:** v1.x (one minor release per batch)

**Exit criteria:** defined per epic when the client schedules it.

**Merge points:** same rules as the launch sprints. Each epic's API task merges first, behind a feature flag (`features.<name>` setting) so it can ship dark and be switched on from the dashboard.

## EPIC PLD — Post-launch design
- reqs: NFR-USB
Design for the post-launch features. The approved prototype already has first versions of points, Sahm Al-Khair and stories, so adapt them to Jazlah rather than starting from zero.

### PLD-DES-1 — Screens: loyalty, stories, Sahm Al-Khair, installments, slots, reorder/gift/favorites, feed checkout, vendor staff
`type: Task · area: design · size: XL · prio: P1 · reqs: FR-LOY-02, FR-STR-01, FR-CHR-01, FR-PAY-04, FR-SCH-08, FR-ORD-06, FR-ORD-07, FR-CAT-04, FR-FED-07, FR-VND-07 · depends: DSN-DES-1`

**What:** design the phase-2 features before each one is scheduled. Loyalty, stories and Sahm Al-Khair were designed on 2026-11-13 and their epics moved to Sprint 6 on 2026-11-18; what is left here is installments, slots, reorder/gift/favorites, feed checkout, vendor staff and the seasonal theme.

**Output:** points screen and checkout redeem; stories bar, viewer and posting (from the prototype's story view); Sahm Al-Khair (from the prototype); installments at checkout; time-slot picker; reorder, gift form and favorites; feed "buy now" and feed orders; vendor staff management; seasonal theme variant. All in Arabic (RTL) with every state.

**Where:** Figma file «Jazlah — Product Design», `design/figma/scripts/`, `docs/design/post-launch/`

**Acceptance:**
- [ ] Each feature's screens are designed and prototyped before its epic is scheduled

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

### BNPL-MOB-1 — Mobile: installments at checkout
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

### MSL-MOB-1 — Mobile & dashboard: slot selection & settings
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

### RGF-MOB-1 — Mobile: reorder, gift & favorites
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

### VRF-MOB-1 — Mobile & dashboard: badge display & seasonal theme
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
