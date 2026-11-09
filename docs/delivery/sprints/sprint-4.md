# Sprint 4 — Delivery, notifications, after-sales & dashboards

> **Goal:** run the business day-to-day. Live gateway in the clients, cancellation with refunds and complaints, ready orders becoming delivery-company shipments with webhooks back, notifications on every status change, the vendor live board with freshness proof, and admin operations (staff/permissions, KPIs, full order operations, customers, finance and payouts).

**Release:** v0.4.0

**Exit criteria (demo on staging):**
- Cancelling before "preparing" refunds to the card or the wallet and frees the capacity. A complaint with photos is resolved with a partial refund.
- Vendor marks an order ready → shipment created (provider sandbox or manual adapter) → webhook updates → delivered, with a push to the customer at each stage. With the provider down, the admin assigns a courier manually and can reschedule.
- The vendor board plays a sound for a new order. Vendor (and admin, for Jazlah's own orders) records the slaughter time and uploads a photo, and the customer sees it.
- A delivered partner order creates commission and ledger entries. The weekly payout batch shows the right net amount, and the vendor sees it in Earnings.
- An admin with limited permissions can't open finance. Every admin action is in the audit log.

**Merge points:**
- MP-1: CAN-API-1, NOT-API-1, DLV-API-1, ADM-API-1 (permissions) and FIN-API-1 (ledger) merge first.
- DLV-API-2 and PAY-MOB-2 depend on client inputs (`needs-client`). If late, release with the manual adapter and the fake provider and carry them over. Nothing else in the sprint waits on them.
- MP-4: REL-INF-4.

**Parallel tracks:** Backend: CAN/DLV/NOT/VOP/ADM/FIN-API · Dashboard: CAN-DSH-1, DLV-DSH-1, VOP-DSH-1, NOT-DSH-1, ADM-DSH-*, FIN-DSH-1 · Mobile: PAY-MOB-2, CAN-MOB-1, DLV-MOB-1, NOT-MOB-1 · Web: CAN-WEB-1, DLV-WEB-1

## EPIC PAY — Payments
- reqs: FR-PAY-01
Live gateway hookup in the clients once the client's gateway is integrated (PAY-API-2).

### PAY-MOB-2 — Mobile & web: live gateway SDK, Apple Pay certificates & device tests
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-PAY-01 · depends: PAY-API-2, PAY-MOB-1, ORD-WEB-1 · labels: needs-client`

**What:** switch the app and website from the fake provider to the chosen gateway.

**Output:** gateway native SDK / hosted page in the Flutter payment step, Apple Pay merchant ID + certificate per flavor, Apple Pay on the web (domain association file, merchant validation), mada/card 3DS on the web form; real-device test report

**How:** keep the provider choice server-driven (payment-methods endpoint returns provider + method config). No client branching on provider names beyond the SDK adapter.

**Where:** `apps/mobile/lib/features/payment/`, `apps/web/src/app/[locale]/(shop)/checkout/payment`, `apps/web/public/.well-known/`

**Acceptance:**
- [ ] Sandbox payments succeed on a real iPhone (Apple Pay) and an Android device (mada test card)
- [ ] Apple Pay works on Safari against the staging domain

## EPIC OPX — Operations UX (design)
- reqs: NFR-USB
Design for everything Sprint 4 builds: after-sales, tracking, notifications, the vendor live board, and the admin core and finance dashboards.

### OPX-DES-1 — Screens: after-sales, tracking, notifications, vendor board, admin & finance
`type: Task · area: design · size: XL · prio: P0 · reqs: FR-CAN-01, FR-CAN-03, FR-ORD-05, FR-NOT-03, FR-VND-04, FR-VND-06, FR-ADM-01, FR-ADM-03, FR-ADM-06, FR-ADM-12 · depends: DSN-DES-1`

**What:** design every screen Sprint 4 implements, in the approved Jazlah identity. Ideally done during Sprint 3, so development isn't waiting.

**Output:**
- Customer (mobile + web): cancel order flow with refund choice, complaint form with photos and status, tracking card (courier, call, track link/map), freshness card on the order, notification center, support contact, marketing opt-in
- Vendor dashboard: live orders board (columns, new-order alert state, card actions, slaughter time picker, freshness upload), A6 order label, earnings (summary, entries, payouts)
- Admin dashboard: overview KPIs and charts, full orders list and detail timeline with actions (cancel/refund, reschedule, label), customers list and detail, complaints queue, delivery operations (shipments, manual assign, failed deliveries, COD settlements), staff and roles permission matrix, audit log with diff, finance (balances, payouts, reports), campaign composer
- All in AR and EN with loading, empty, error and permission-denied states

**Where:** Figma file «Jazlah — Product Design» (pages `10 Customer App`, `20 Customer Web`, `30 Admin`, `31 Vendor`), scripts in `design/figma/scripts/`, exports in `docs/design/operations/`

**Acceptance:**
- [ ] Every screen listed is designed in AR and EN with all states, using only design-system components
- [ ] The vendor board and admin order detail are prototyped end-to-end
- [ ] Both developers signed off

## EPIC CAN — Cancellation & complaints
- reqs: FR-CAN-01, FR-CAN-02, FR-CAN-03
Free cancellation before slaughter with a refund choice, then customer-service-only cancellation, and post-delivery complaints with photos.

### CAN-API-1 — Cancellation, refunds & complaints
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-CAN-01, FR-CAN-02, FR-CAN-03 · depends: ORD-API-2, PAY-API-1, WAL-API-1, FND-API-4`

**What:** cancel and get money back.

This task also covers:
- **Complaints & return requests:** after receiving an order the customer can complain within a window.

**Output:**

*Customer cancellation & refunds*
- `POST /v1/customer/orders/:id/cancel {reason, refundTo: original|wallet}` (allowed in `pending_payment|new|confirmed`, otherwise `CANCEL_NOT_ALLOWED` with the customer-service hint); `POST /v1/admin/orders/:id/cancel {reason, refundTo, amount?}` at any stage (audited); `RefundService` handles gateway refunds or wallet credit, releases capacity, reverts coupon redemption, reverses the wallet portion

*Complaints & return requests*
- `Complaint` (orderId, type quality|missing|wrong|late|other, description, mediaIds[], status open|in_review|resolved|rejected, resolution {refundAmount, refundTo, note}, handledBy); `POST /v1/customer/orders/:id/complaints` (only within `ops.complaintWindowHours` after delivered/collected), `GET` own complaints; admin list/detail/resolve endpoints (resolve can trigger a partial refund via `RefundService`)

**How:**

*Customer cancellation & refunds*
- a refund to `original` for a COD order is impossible, so it goes to the wallet automatically. A gateway refund failure goes to a retry queue and alerts the admin, and the order shows "refund pending".

**Where:** `services/api/src/modules/refunds/`, `services/api/src/modules/orders/`, `services/api/src/modules/complaints/`

**Acceptance:**
- [ ] e2e: cancel confirmed card order → refund to wallet → balance increased; capacity released
- [ ] e2e: cancel during `preparing` → 409 `CANCEL_NOT_ALLOWED`
- [ ] e2e: complaint after the window → `COMPLAINT_WINDOW_CLOSED`
- [ ] Resolving with a refund credits the wallet and notifies the customer (event)

### CAN-DSH-1 — Dashboard: complaints queue & customer wallet adjustments
`type: Feature · area: dashboard · size: M · prio: P0 · reqs: FR-CAN-03, FR-WAL-02 · depends: CAN-API-1, WAL-API-1, OPX-DES-1`

**What:** customer service handles complaints.

This task also covers:
- **Dashboard: customer wallet view & manual adjustment:** admins see and adjust a customer's wallet. The full customer pages come in ADM-DSH-2.

**Output:**

*Dashboard: complaints queue*
- `/admin/complaints`: queue by status, detail with order summary and photos, resolve dialog (refund amount, destination, note), reject with note

*Dashboard: customer wallet view & manual adjustment*
- `/admin/customers/[id]/wallet`: balance, history, adjust dialog

**Where:** `apps/dashboard/src/app/[locale]/admin/complaints`, `apps/dashboard/src/app/[locale]/admin/customers`

**Acceptance:**
- [ ] Resolving updates the customer's complaint status
- [ ] The adjustment shows immediately in the customer's app

### CAN-MOB-1 — Mobile: cancel order, complaints & wallet
`type: Feature · area: mobile · size: L · prio: P0 · reqs: FR-CAN-01, FR-CAN-02, FR-CAN-03, FR-WAL-01 · depends: CAN-API-1, ORD-MOB-2, WAL-API-1, OPX-DES-1`

**What:** self-service cancellation and complaints.

This task also covers:
- **Mobile: wallet screen:** customers see their balance and history.

**Output:**

*Mobile: cancel order & raise complaint*
- cancel button (only when `canCancel`) → reason + refund destination → confirmation; after slaughter, a "contact support" button replaces it; complaint form with type, description and up to 5 photos (camera/gallery, compressed) and status tracking

*Mobile: wallet screen*
- `features/wallet`: balance card, transactions list with reasons and links to orders

**Where:** `apps/mobile/lib/features/orders/`, `apps/mobile/lib/features/complaints/`, `apps/mobile/lib/features/wallet/`

**Acceptance:**
- [ ] Cancel and complaint flows work end-to-end on staging
- [ ] The list paginates and links to the related order

### CAN-WEB-1 — Web: cancel order, complaints & wallet
`type: Feature · area: web · size: M · prio: P1 · reqs: FR-CAN-01, FR-CAN-03, FR-WAL-01 · depends: CAN-API-1, ORD-WEB-2, WAL-API-1, OPX-DES-1`

**What:** the same on the website.

This task also covers:
- **Web: wallet page:** wallet on the website.

**Output:**

*Web: cancel order & raise complaint*
- cancel dialog and complaint form on the order detail page

*Web: wallet page*
- `/[locale]/wallet`

**Where:** `apps/web/src/app/[locale]/(account)/orders/[id]`, `apps/web/src/app/[locale]/(account)/wallet`

**Acceptance:**
- [ ] Works with photo upload via presigned URLs
- [ ] Matches the mobile data

## EPIC DLV — Delivery company integration
- reqs: INT-DLV-01, INT-DLV-02, INT-DLV-03, INT-DLV-04, INT-DLV-05, FR-ORD-05
No driver app. Shipments are created with the contracted delivery company through an adapter, with webhooks for status and a manual fallback.

### DLV-DOC-1 — Spike: delivery company API review (ADR-0005)
`type: Task · area: api · size: S · prio: P0 · reqs: INT-DLV-05 · labels: spike, needs-client`

**What:** understand the contracted delivery company's API before coding.

**Output:** `docs/adr/0005-delivery-integration.md`: auth, create/cancel shipment payloads, pickup scheduling, COD support and settlement reports, webhook events and signatures, tracking link / live location, SLAs, sandbox; a status mapping table → our order statuses

**Where:** `docs/adr/`

**Acceptance:**
- [ ] Mapping table reviewed by both developers; sandbox credentials stored as secrets

### DLV-API-1 — Delivery port, shipments, manual adapter & COD reconciliation
`type: Feature · area: api · size: L · prio: P0 · reqs: INT-DLV-01, INT-DLV-05, INT-DLV-04, FR-ADM-06 · depends: ORD-API-2`

**What:** provider-independent shipments, plus a manual mode that always works.

This task also covers:
- **COD settlement reconciliation:** track cash collected by couriers until the provider settles it.

**Output:**

*Delivery port, shipment model & manual adapter*
- `Shipment` (orderId, provider, externalId?, status created|assigned|picked_up|in_transit|delivered|failed|cancelled, courierName?, courierPhone?, trackingUrl?, lastLocation?, pickupPoint vendor|kitchen + snapshot, codAmountHalalas, attempts, rawLast)
- `integrations/delivery/delivery.port.ts`: `createShipment`, `cancelShipment`, `verifyWebhook`, `parseWebhook`, `getStatus?`
- `providers/manual.ts`: no external calls; the admin enters the courier and status
- A listener on `order.status.changed → ready` (delivery orders only) creates the shipment via the active provider (setting `delivery.provider`)
- `POST /v1/admin/shipments/:id/assign {courierName, courierPhone}`, `POST /v1/admin/shipments/:id/status {status}` (mapped to order transitions)

*COD settlement reconciliation*
- `CodSettlement` (provider, reference, period, totalHalalas, shipmentIds[], status pending|settled, settledAt); `GET /v1/admin/cod/outstanding`, `POST /v1/admin/cod/settlements` (create from selected shipments or a CSV import), mark settled
- `POST /v1/admin/orders/:id/reschedule {date}`: releases the old day's capacity, reserves the new day (`CapacityService`), cancels/recreates the shipment if one exists, notifies the customer

**Where:** `services/api/src/integrations/delivery/`, `services/api/src/modules/delivery/`

**Acceptance:**
- [ ] e2e (manual provider): ready → shipment created → admin assigns → delivered → order delivered
- [ ] The outstanding total equals the sum of delivered COD shipments not yet settled

### DLV-API-2 — Delivery company adapter + webhooks & courier info
`type: Feature · area: api · size: XL · prio: P0 · reqs: INT-DLV-01, INT-DLV-05, INT-DLV-02, INT-DLV-03, FR-ORD-05 · depends: DLV-API-1, DLV-DOC-1 · labels: needs-client`

**What:** create and cancel shipments with the real provider.

This task also covers:
- **Delivery webhooks & courier info:** status updates from the provider move our orders.

**Output:**

*Delivery company provider adapter*
- `providers/<company>.ts`; create on ready with pickup address (vendor or kitchen), drop-off, customer name and phone, COD amount, delivery window; cancel when an order is cancelled after shipment creation; BullMQ retries with backoff; after N failures → alert the admin and switch that shipment to manual

*Delivery webhooks & courier info*
- `POST /v1/webhooks/delivery/:provider` (signature check, idempotent by event id); status mapping → `OrdersService.transition` (assigned → stores courier; picked_up → `picked_up`; in_transit → `out_for_delivery`; delivered → `delivered`; failed → `delivery_failed`); tracking data (courier, tracking URL or last location) in the customer order detail

**Where:** `services/api/src/integrations/delivery/providers/`, `services/api/src/modules/delivery/`

**Acceptance:**
- [ ] Sandbox: create + cancel succeed; a forced failure falls back to manual with an admin alert
- [ ] e2e with recorded webhook fixtures for every event type
- [ ] Out-of-order webhooks never move an order backwards

### DLV-DSH-1 — Dashboard: delivery operations
`type: Feature · area: dashboard · size: M · prio: P0 · reqs: INT-DLV-04, INT-DLV-05 · depends: DLV-API-1, OPX-DES-1`

**What:** admins watch and fix deliveries.

**Output:** `/admin/delivery`: shipments table (status, provider, failures highlighted), manual assign and status override, failed-delivery actions (reschedule → new date, return, cancel with refund), COD outstanding and settlements screen

**Where:** `apps/dashboard/src/app/[locale]/admin/delivery`

**Acceptance:**
- [ ] Every manual action updates the order and notifies the customer

### DLV-MOB-1 — Mobile: order tracking & freshness block
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-ORD-05, INT-DLV-03, FR-FRS-01, FR-FRS-02 · depends: ORD-MOB-2, VOP-API-1, DLV-API-1, OPX-DES-1`

**What:** customers see who is bringing their order.

This task also covers:
- **Mobile: freshness block on the order:** customers see when and how their animal was slaughtered.

**Output:**

*Mobile: order tracking*
- tracking card on the order detail: courier name, call button, "Track" (opens the provider link in an in-app browser) or a live map pin if location is provided

*Mobile: freshness block on the order*
- freshness card on the order detail: slaughter date and time, photo/video viewer, vet name/stamp

**How:**
- Reads courier and tracking fields from the shipment. They're filled by the manual adapter now and by the provider webhooks (DLV-API-2) later, with no client change.

**Where:** `apps/mobile/lib/features/tracking/`, `apps/mobile/lib/features/orders/`

**Acceptance:**
- [ ] Card only shows from `picked_up` onward
- [ ] The video plays inline and the card is hidden when there's no record

### DLV-WEB-1 — Web: tracking, freshness & notification center
`type: Feature · area: web · size: S · prio: P1 · reqs: FR-ORD-05, FR-FRS-01, FR-FRS-02, FR-NOT-03 · depends: ORD-WEB-2, VOP-API-1, NOT-API-1, DLV-API-1`

**What:** tracking card on the website order page.

This task also covers:
- **Web: freshness block on the order:** the same on the website.
- **Web: notification center & support links:** inbox and support on the website.

**Output:**

*Web: order tracking*
- courier info and tracking link on `/[locale]/orders/[id]`

*Web: freshness block on the order*
- freshness card on `/[locale]/orders/[id]`

*Web: notification center & support links*
- header bell with the inbox dropdown, contact links in the footer and order page

**Where:** `apps/web/src/app/[locale]/(account)/orders/[id]`, `apps/web/src/components/notifications/`

**Acceptance:**
- [ ] Same data as mobile
- [ ] Same data as mobile
- [ ] Unread count updates on read

## EPIC NOT — Notifications & support contact
- reqs: FR-NOT-01, FR-NOT-02, FR-NOT-03
Push and SMS for status changes, an in-app inbox, marketing campaigns, and support contact.

### NOT-API-1 — Notification service (push, SMS, inbox) & marketing campaigns
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-NOT-01, FR-NOT-03, NFR-LNG, FR-NOT-02 · depends: ACC-API-2, ORD-API-2`

**What:** one service that turns domain events into messages.

This task also covers:
- **Marketing campaigns & segments:** admins send marketing pushes.

**Output:**

*Notification service (push, SMS, inbox)*
- `Notification` (userId, type, titleAr/En, bodyAr/En, data {route, id}, readAt) and the inbox endpoints `GET /v1/customer/notifications`, `POST …/read`, unread count
- `integrations/push/fcm.ts` (firebase-admin, multicast to the user's devices, removes invalid tokens)
- Templates in `notifications/templates/{ar,en}.ts` per event: order confirmed / preparing / ready / out for delivery / delivered / cancelled / refund issued / complaint resolved (visits, chat and occasions are added by their sprints)
- SMS only for critical events: order confirmed, out for delivery, delivery failed
- Subscribes to domain events and sends through a BullMQ queue (retries)

*Marketing campaigns & segments*
- `Campaign` (titleAr/En, bodyAr/En, deepLink, segment {city?, locale?, hasOrdered?, lastOrderBeforeDays?, all}, scheduledAt?, status, sentCount); `/v1/admin/campaigns` CRUD + send/schedule; segment size preview endpoint; batched sends via BullMQ (500 per batch)

**How:**

*Notification service (push, SMS, inbox)*
- the message language follows the user's `locale`. Data payloads carry the deep-link route (`/orders/:id`).

*Marketing campaigns & segments*
- send only to users with marketing consent (opt-in, default off, from ACC-API-2), togglable in the app settings.

**Where:** `services/api/src/modules/notifications/`, `services/api/src/integrations/push/`, `services/api/src/modules/notifications/campaigns/`

**Acceptance:**
- [ ] e2e (FCM mocked): a status change creates an inbox row and a push call with the right locale
- [ ] An invalid FCM token is deleted after the error
- [ ] The preview count matches the delivered count in a seeded test

### NOT-MOB-1 — Mobile: push, deep links, notification center & support contact
`type: Feature · area: mobile · size: M · prio: P0 · reqs: FR-NOT-01, FR-NOT-03 · depends: NOT-API-1, ORD-MOB-2, SCH-API-1, OPX-DES-1`

**What:** receive and act on notifications.

This task also covers:
- **Mobile: support contact:** quick access to customer service.

**Output:**

*Mobile: push, deep links & notification center*
- `features/notifications`: FCM/APNs setup per flavor, permission prompt after the first order (not at launch), token registration and refresh, foreground banners, tap → deep link via go_router, notification center with unread badge, marketing opt-out toggle in settings

*Mobile: support contact*
- "Contact us" in account and order detail: WhatsApp deep link (with order number prefilled) and phone call, numbers from `/v1/public/settings/client`

**Where:** `apps/mobile/lib/features/notifications/`, `apps/mobile/lib/features/support/`

**Acceptance:**
- [ ] Tapping a push from a killed state opens the right order
- [ ] iOS push works on a real device (APNs key configured)
- [ ] WhatsApp opens with the order number in the message

### NOT-DSH-1 — Dashboard: campaign composer
`type: Feature · area: dashboard · size: S · prio: P1 · reqs: FR-NOT-02, FR-ADM-09 · depends: NOT-API-1, OPX-DES-1`

**What:** admins create and schedule campaigns.

**Output:** `/admin/marketing/campaigns`: list with status and counts, composer (AR/EN, deep link picker, segment builder with live count, schedule)

**Where:** `apps/dashboard/src/app/[locale]/admin/marketing/campaigns`

**Acceptance:**
- [ ] A scheduled campaign sends at the set time (staging)

## EPIC VOP — Vendor order operations & freshness
- reqs: FR-VND-04, FR-FRS-01, FR-FRS-02
The vendor's live board: sound alerts, status updates, slaughter time, freshness media, and requesting the courier.

### VOP-API-1 — Vendor order actions & freshness record
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-VND-04, FR-FRS-01, FR-FRS-02 · depends: ORD-API-3, FND-API-4`

**What:** the actions a vendor takes on an order.

This task also covers:
- **Freshness record:** optional proof of freshness shown to the customer (recommended, not mandatory).

**Output:**

*Vendor order actions*
- `POST /v1/vendor/orders/:id/start-preparing {slaughteredAt?}` (required when the order contains carcass items), `…/mark-ready` (triggers shipment creation for delivery orders), `…/mark-collected` (pickup), `…/request-courier` (manual adapter → admin alert; real provider → create shipment now); permission: owner of the order's vendor

*Freshness record*
- `FreshnessRecord` (orderId, slaughteredAt, mediaIds[] (photo or video ≤ 30 s), vetName?, vetStampMediaId?); `PUT /v1/vendor/orders/:id/freshness`; included in the customer order detail
- Admin equivalents for Jazlah's own orders (the platform vendor): `POST /v1/admin/orders/:id/{start-preparing|mark-ready|mark-collected|request-courier}` and `PUT /v1/admin/orders/:id/freshness`, permission `orders.manage`

**Where:** `services/api/src/modules/orders/controllers/vendor.controller.ts`, `services/api/src/modules/freshness/`

**Acceptance:**
- [ ] e2e: start-preparing without `slaughteredAt` on a carcass order → 400
- [ ] e2e: the record shows on the customer's order; video over 30 MB is rejected

### VOP-DSH-1 — Dashboard: vendor live orders board
`type: Feature · area: dashboard · size: L · prio: P0 · reqs: FR-VND-04, FR-FRS-01, FR-FRS-02 · depends: VOP-API-1, ORD-DSH-1, OPX-DES-1`

**What:** the screen vendors keep open all day.

**Output:** `/vendor/orders` upgraded to a board: columns by status, filter by delivery day, realtime insert with a looping sound alert until acknowledged (browser audio unlock on first click, plus a desktop Notification API alert), order card actions (start preparing with a slaughter-time picker, upload freshness media, mark ready, request courier, mark collected), printable order label (A6: order number + QR, customer, day/window, items with options and exclusions)
- The same board and actions are available to admins at `/admin/orders/board` for Jazlah's own orders

**Where:** `apps/dashboard/src/app/[locale]/vendor/orders`, `apps/dashboard/src/features/orders/`

**Acceptance:**
- [ ] The sound keeps playing for a new order until a staff member acknowledges it
- [ ] The label prints correctly on A6 from Chrome

## EPIC ADM — Admin core: staff & permissions, KPIs, orders, customers
- reqs: FR-ADM-01, FR-ADM-03, FR-ADM-10, FR-ADM-12
The Jazlah team's daily console: staff and roles, the audit log, the KPI overview, full order operations and customer management.

### ADM-API-1 — Staff accounts, roles & permissions, audit log API
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-ADM-12, NFR-SEC · depends: FND-API-3, FND-API-4 · labels: security`

**What:** fine-grained access for the Jazlah team.

**Output:**
- `AdminRole` (name, permissions[]) and `AdminStaff` (userId, roleId, isActive). Permissions catalogue in `admin-users/permissions.ts`: `orders.view`, `orders.manage`, `catalog.manage`, `vendors.manage`, `customers.manage`, `finance.view`, `finance.manage`, `marketing.manage`, `settings.manage`, `kitchens.manage`, `occasions.manage`, `feed.moderate`, `staff.manage`
- `/v1/admin/staff` CRUD (invite by phone → the person logs in via staff OTP), `/v1/admin/roles` CRUD, seeded roles: Super Admin, Operations, Customer Service, Finance, Marketing, Moderator
- `GET /v1/admin/audit-log` (filters: actor, entity, action, date)
- `PermissionsGuard` (from FND-API-3) applied to **every existing admin controller** with the right permission

**How:** the access token carries `perms`. Changing a role invalidates its tokens via a per-user `permsVersion` check. Add an e2e matrix test (role × endpoint) generated from the permissions map.

**Where:** `services/api/src/modules/admin-users/`, `services/api/src/modules/audit/`, all `controllers/admin.controller.ts`

**Acceptance:**
- [ ] e2e matrix: every admin endpoint returns 403 without its permission
- [ ] Super Admin can't remove the last Super Admin

### ADM-API-2 — KPI & customer admin endpoints
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-ADM-01, FR-ADM-10 · depends: ORD-API-2, ADM-API-1`

**What:** numbers for the overview, plus customer management.

**Output:**
- `GET /v1/admin/kpis?from&to` → sales (gross, net of refunds), orders count and by status, average order value, new customers, top vendors and top products, COD share; daily series for charts
- `GET /v1/admin/customers` (search phone/name), `GET /v1/admin/customers/:id` (profile, orders, wallet, complaints, addresses), `POST …/block|unblock {reason}` (blocked users can't place orders or post in the feed)

**How:** aggregate with SQL, Riyadh-day buckets, Redis cache for 5 min. Add an index on `orders(created_at, status)`.

**Where:** `services/api/src/modules/reports/`, `services/api/src/modules/users/controllers/admin.controller.ts`

**Acceptance:**
- [ ] KPI totals match a hand-computed seeded dataset
- [ ] A blocked customer gets `USER_BLOCKED` on checkout

### ADM-DSH-1 — Dashboard: overview, staff & roles, audit log
`type: Feature · area: dashboard · size: L · prio: P0 · reqs: FR-ADM-01, FR-ADM-12 · depends: ADM-API-1, ADM-API-2, OPX-DES-1`

**What:** the admin landing page and team management.

**Output:**
- `/admin` overview: KPI cards, sales line chart, orders-by-status bar, top vendors and products tables, date range picker, today's live counter (socket)
- `/admin/staff` (invite, role, deactivate), `/admin/roles` (permission checklist grouped by area), `/admin/audit-log` (filterable table with a before/after diff viewer)
- Sidebar and route guards driven by the user's permissions

**Where:** `apps/dashboard/src/app/[locale]/admin/{page.tsx,staff,roles,audit-log}`

**Acceptance:**
- [ ] A Finance-only user sees only the finance menu and gets a 403 page elsewhere
- [ ] Charts render correctly in RTL

### ADM-DSH-2 — Dashboard: full order operations & customers
`type: Feature · area: dashboard · size: L · prio: P0 · reqs: FR-ADM-03, FR-ADM-10 · depends: ORD-DSH-1, CAN-API-1, ADM-API-2, DLV-DSH-1, OPX-DES-1`

**What:** customer service and operations handle any order and any customer.

**Output:**
- `/admin/orders` upgraded: filters (status, vendor, day, method, payment, search by number or phone), saved views (Today's deliveries, COD to review, Refund pending, Delivery failed), detail page with full timeline (status history + payments + refunds + shipment + freshness + complaints), actions (transition, cancel with refund, reschedule day, edit internal note, print label), CSV export
- `/admin/customers` list and detail (orders, wallet with adjust from WAL, complaints, addresses), block/unblock

**Where:** `apps/dashboard/src/app/[locale]/admin/{orders,customers}`

**Acceptance:**
- [ ] Every action in the detail page writes to the audit log and refreshes the timeline
- [ ] CSV export opens correctly in Excel with Arabic text (UTF-8 BOM)

## EPIC FIN — Finance: commissions, payouts & reports
- reqs: FR-ADM-06, FR-VND-06, INT-DLV-04
Jazlah collects all payments and settles partner vendors weekly, minus commission.

### FIN-API-1 — Commission engine & vendor ledger
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-ADM-06, FR-VND-06 · depends: ORD-API-2, CAN-API-1`

**What:** what each vendor earns from every order, kept as an auditable ledger.

**Output:** `VendorLedgerEntry` (vendorId, orderId?, type sale|commission|refund_adjustment|payout|manual_adjustment, amountHalalas signed, balanceAfter, note, createdBy?); a listener on `order.status.changed → delivered|collected` writes the sale (items subtotal after vendor-scoped discount) and the commission (−rate × base, with the rate snapshotted on the order at placement); refunds after delivery write adjustments; Jazlah's own vendor (isPlatform) is excluded

**How:** decisions recorded in code comments and STATUS.md:
- The delivery fee belongs to Jazlah.
- Platform-wide coupons are funded by Jazlah, so they don't reduce the vendor base.
- Vendor-scoped coupons reduce the vendor base.

Idempotency: `sale`/`commission` unique by (orderId, type); `refund_adjustment` unique by `refundId`, so several partial refunds on one order are all recorded.

**Where:** `services/api/src/modules/finance/`

**Acceptance:**
- [ ] Unit tests for each coupon-funding case and for a post-delivery partial refund
- [ ] The vendor balance always equals the sum of its ledger entries

### FIN-API-2 — Weekly payouts & finance reports
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-ADM-06, FR-VND-06, INT-DLV-04 · depends: FIN-API-1, DLV-API-1`

**What:** settle vendors weekly and give finance the reports it needs.

**Output:**
- `Payout` (vendorId, periodStart, periodEnd, amountHalalas, status scheduled|paid|on_hold, transferRef?, paidAt?, paidBy?); a weekly job (setting `finance.payoutDay`, default Sunday) creates payouts for positive balances; `POST /v1/admin/payouts/:id/mark-paid {transferRef, paidAt}` writes the payout ledger entry; `on_hold` for suspended vendors
- Vendor: `GET /v1/vendor/earnings` (summary: sales, commission, net, balance, next payout) and `GET /v1/vendor/earnings/entries`, `GET /v1/vendor/payouts`
- Reports: `GET /v1/admin/reports/sales` (by day/vendor/category), `/reports/vat` (output VAT per period, from order vatAmount), `/reports/cod` (links DLV-API-1 settlements); CSV/XLSX export

**Where:** `services/api/src/modules/finance/`, `services/api/src/modules/reports/`

**Acceptance:**
- [ ] e2e: a week of seeded orders → one payout per vendor with the correct net
- [ ] VAT report total equals the sum of order VAT for the period

### FIN-DSH-1 — Dashboard: admin finance & vendor earnings
`type: Feature · area: dashboard · size: L · prio: P0 · reqs: FR-ADM-06, FR-VND-06 · depends: FIN-API-2, ADM-DSH-1, OPX-DES-1`

**What:** finance screens for both sides.

**Output:**
- `/admin/finance`: vendor balances table, payouts (scheduled/paid/on hold, mark paid with transfer reference), vendor ledger drill-down, reports page (sales, VAT, COD) with export
- `/vendor/earnings`: summary cards, entries table, payouts history and the next payout date

**Where:** `apps/dashboard/src/app/[locale]/admin/finance`, `apps/dashboard/src/app/[locale]/vendor/earnings`

**Acceptance:**
- [ ] Vendor numbers match the admin view for the same vendor
- [ ] Only `finance.*` permissions can see the admin finance pages

## EPIC REL — Releases & merge points

### REL-INF-4 — Release v0.4.0 (Sprint 4 merge point)
`type: Task · area: infra · size: XS · prio: P0 · depends: DLV-DSH-1, DLV-MOB-1, NOT-MOB-1, VOP-DSH-1, ADM-DSH-1, ADM-DSH-2, FIN-DSH-1, CAN-MOB-1, CAN-DSH-1, PAY-MOB-2`

**What:** close Sprint 4.

**Output:** `release/v0.4.0` → `main`, tag, back-merge, mobile staging build, STATUS.md updated (record whether DLV-API-2 shipped or moved)

**Where:** git, `docs/delivery/STATUS.md`

**Acceptance:**
- [ ] Exit criteria demoed and ticked in the release PR
