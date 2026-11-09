# Sprint 6 — Farm visits, feed marketplace & chat, ratings, content & ZATCA

> **Goal:** complete the launch scope. Farm visits and animal reservation, the feed marketplace with in-app chat and moderation, ratings, marketing content and legal pages, and ZATCA-compliant e-invoicing (including advance payments).

**Release:** v0.6.0 (**feature-complete for launch**)

**Exit criteria (demo on staging):**
- Visit: a customer books a slot at a partner farm → the vendor registers the chosen animal (tag + photo) → the customer pays a deposit and schedules slaughter as an order. The fee and deposit show up correctly in vendor earnings.
- Feed: seller application → approval → listing with photos → a buyer finds it by type and city and chats with images → report → admin bans from moderation. A buy request gets a seller reply that opens a chat.
- Ratings: rate a delivered order → the store average updates. CMS: a banner and the privacy/terms pages show in the app and on the web.
- Every delivered order and every deposit or fee has an invoice (PDF AR/EN with QR) reported to the ZATCA sandbox. A refund produces a credit note.

**Merge points:**
- MP-1: CHT-API-1 and FED-API-1 first. VIS-API-1 → VIS-API-2 → VIS-API-3. INV-API-1 (generation) before INV-API-2 (reporting).
- INV-API-2 depends on the client's ZATCA onboarding (`needs-client`). Use the ZATCA developer sandbox until then.
- MP-4: REL-INF-6. After this release, the scope is frozen for launch: only fixes and Sprint 7 hardening.

**Parallel tracks:** Backend: VIS-API-*, FED-API-*, CHT-API-1, RAT-API-1, CMS-API-1, INV-API-* · Mobile: VIS-MOB-1, FED-MOB-1, CHT-MOB-1, RAT-MOB-1, CMS-MOB-1, INV-MOB-1 · Web: VIS-WEB-1, FED-WEB-1 · Dashboard: VIS-DSH-1, FED-DSH-1, RAT-DSH-1, CMS-DSH-1 · Design: FED-DES-1

## EPIC FED — Feed marketplace
- reqs: FR-FED-01, FR-FED-02, FR-FED-03, FR-FED-05, FR-FED-06, FR-ADM-11
Listings and buy requests between livestock owners and feed sellers. At launch the deal happens off-platform after the chat. Paid transactions come post-launch (FR-FED-07).

### FED-DES-1 — Screens: feed marketplace & chat
`type: Task · area: design · size: M · prio: P0 · reqs: FR-FED-02, FR-FED-03, FR-FED-04, FR-FED-05 · depends: DSN-DES-1`

**What:** the feed section and chat UX.

**Output:** feed home (types, nearby listings, buy requests), filters, listing detail (gallery, price per unit, seller, contact), post/edit listing, seller application, my listings, buy-request board and form, conversations list, chat screen (text, images, report/block), moderation screens in the dashboard

**Where:** Figma (link in the issue)

**Acceptance:**
- [ ] AR/EN, all states; signed off by both developers

### FED-API-1 — Feed sellers, listings & buy requests
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-FED-01, FR-FED-02, FR-FED-03, FR-FED-05 · depends: ACC-API-2, FND-API-4, LOC-API-1`

**What:** the marketplace data and search.

**Output:**
- `FeedSellerApplication` (userId, businessName, crNumber?, city, phone, notes, status pending|approved|rejected, reason?) → sets `user.isFeedSeller`
- `FeedType` lookup (برسيم، شعير، علف مركز، تبن، ذرة…), `FeedListing` (sellerId, typeId, title, description, quantity, unit bale|ton|kg|bag, priceHalalasPerUnit, city, point, images[], deliveryAvailable, deliveryNotes, status active|paused|expired|removed, expiresAt (30 days, renewable))
- `FeedBuyRequest` (userId, typeId, quantity, unit, city, point?, neededBy?, notes, status open|closed|expired)
- Customer endpoints: apply, CRUD own listings (approved sellers only), renew, pause; `GET /v1/public/feed/listings?type&city&priceMin&priceMax&near=lat,lng&sort=nearest|newest|price` (PostGIS distance), listing detail; buy requests CRUD and browse; `POST /v1/customer/feed/buy-requests/:id/respond` → opens a chat (CHT-API-1)
- Expiry job and an expiring-soon push to sellers

**Where:** `services/api/src/modules/feed/`

**Acceptance:**
- [ ] e2e: a non-approved user can't post; "nearest" sort returns by distance
- [ ] Expired listings disappear from browse

### FED-API-2 — Reports, blocks & moderation
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-FED-06, FR-ADM-11 · depends: FED-API-1, CHT-API-1, ADM-API-1`

**What:** keep the marketplace clean.

**Output:** `Report` (reporterId, targetType listing|buy_request|conversation|user, targetId, reason spam|fraud|abuse|prohibited|other, note, status open|actioned|dismissed); `POST /v1/customer/reports`, `POST /v1/customer/users/:id/block|unblock`; admin (`feed.moderate`): seller applications approve/reject, listings list with remove/restore, reports queue with actions (remove content, warn, ban user from the feed via `user.feedBanned`, dismiss), conversation transcript view **only when reported** (audited)

**Where:** `services/api/src/modules/moderation/`, `services/api/src/modules/feed/controllers/admin.controller.ts`

**Acceptance:**
- [ ] Banned users can't post or message; actions appear in the audit log

### FED-DSH-1 — Dashboard: feed moderation
`type: Feature · area: dashboard · size: M · prio: P0 · reqs: FR-ADM-11, FR-FED-06 · depends: FED-API-2, FED-DES-1`

**What:** moderators run the marketplace.

**Output:** `/admin/feed`: seller applications (approve/reject), listings (search, remove/restore), reports queue (target preview, transcript for reported chats, actions), banned users list; feed types lookup management

**Where:** `apps/dashboard/src/app/[locale]/admin/feed`

**Acceptance:**
- [ ] Every action notifies the affected user where relevant

### FED-MOB-1 — Mobile: feed marketplace (buyers & sellers)
`type: Feature · area: mobile · size: XL · prio: P0 · reqs: FR-FED-01, FR-FED-02, FR-FED-03, FR-FED-05, FR-FED-06 · depends: FED-API-2, FED-DES-1`

**What:** the feed section in the app.

**Output:** `features/feed`: feed home (types, nearby, newest, buy requests tab), filters (type, city, price), listing detail (gallery, price per unit, delivery availability, seller card, "Chat with seller", report); seller tools: apply, application status, post/edit listing with photos and a map location, my listings (pause, renew, delete); buy requests: post, my requests, respond as a seller

**Where:** `apps/mobile/lib/features/feed/`

**Acceptance:**
- [ ] A complete seller and buyer journey works on staging, including a report

### FED-WEB-1 — Web: feed browse pages
`type: Feature · area: web · size: S · prio: P2 · reqs: FR-FED-03 · depends: FED-API-1`

**What:** indexable feed listings on the website. Chat stays in the app at launch.

**Output:** `/[locale]/feed` (filters) and `/[locale]/feed/[id]` (SSR, SEO) with a "Chat in the app" CTA (app store links / deep link)

**Where:** `apps/web/src/app/[locale]/(services)/feed`

**Acceptance:**
- [ ] Listing pages render server-side with correct metadata

## EPIC CHT — In-app chat
- reqs: FR-FED-04
Realtime 1:1 chat used by the feed marketplace (buyer ↔ seller), built generically so other contexts can reuse it later.

### CHT-API-1 — In-app chat service
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-FED-04, FR-NOT-01 · depends: FND-API-4, NOT-API-1`

**What:** realtime 1:1 chat, built generically (context = listing or buy request) so it can be reused later.

**Output:** `Conversation` (contextType feed_listing|feed_buy_request, contextId, participantIds[2], lastMessageAt), `Message` (conversationId, senderId, type text|image, body?, mediaId?, createdAt, readAt?), `UserBlock` (blockerId, blockedId); `POST /v1/customer/conversations {contextType, contextId}` (idempotent per pair + context), list with unread counts, `GET …/:id/messages?before=` (cursor), `POST …/:id/messages`, `POST …/:id/read`; socket events `chat.message`, `chat.read` in room `chat:{id}`; a push for new messages when the recipient isn't connected; rate limit of 30 messages/minute; messages to or from a blocked user → `USER_BLOCKED`

**How:** strip links and phone numbers? **No.** Sharing phone numbers is allowed because deals close off-platform at launch. Keep it as a setting `chat.allowPhoneNumbers=true` for later.

**Where:** `services/api/src/modules/chat/`, `services/api/src/realtime/`

**Acceptance:**
- [ ] Socket e2e: a message arrives to the other participant in < 1 s; offline → push
- [ ] Blocked users can't message each other

### CHT-MOB-1 — Mobile: chat
`type: Feature · area: mobile · size: L · prio: P0 · reqs: FR-FED-04 · depends: CHT-API-1, FED-DES-1, NOT-MOB-1`

**What:** conversations in the app.

**Output:** `features/chat`: conversations list (context thumbnail, unread badge), chat screen (realtime socket, optimistic send, retry, image send from camera/gallery, read receipts, pagination), report and block from the chat menu, a push deep link to the conversation

**Where:** `apps/mobile/lib/features/chat/`

**Acceptance:**
- [ ] Messages sent offline are queued and sent on reconnect, or marked failed

## EPIC INV — ZATCA e-invoicing
- reqs: FR-PAY-05, NFR-LNG
A simplified tax invoice for every order, compliant with ZATCA Phase 2 (Fatoora), plus credit notes for refunds.

### INV-API-1 — Invoice generation (UBL XML, QR, PDF)
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-PAY-05, NFR-LNG · depends: INV-DOC-1, ORD-API-2, CAN-API-1, VIS-API-2, OCC-API-2`

**What:** produce compliant invoice documents.

**Output:** `Invoice` (orderId, type simplified_invoice|credit_note, number (sequential, gap-free per series), uuid, issueAt, totals incl. VAT 15%, previousInvoiceHash, invoiceHash, qrBase64, xmlKey, pdfKey, zatcaStatus pending|reported|rejected|error, zatcaResponse); generation on `delivered|collected` (or on payment, per ADR); credit notes on refunds referencing the original; UBL 2.1 XML per the ZATCA data dictionary, hash chain (PIH), TLV QR (seller name, VAT number, timestamp, total, VAT, hash, signature, public key); bilingual PDF (Arabic first) with the QR; `GET /v1/customer/orders/:id/invoice` (signed URL)
- **Advance payments:** an invoice is issued when a deposit or fee is received (occasion deposit/balance, animal deposit, visit fee), and the final invoice deducts the advance, following the ZATCA rules for advance payments and the ADR-0006 decision

**Where:** `services/api/src/modules/invoicing/`, `services/api/src/integrations/zatca/`

**Acceptance:**
- [ ] Generated XML passes the ZATCA SDK validator locally (`fatoora -validate`)
- [ ] Invoice numbers have no gaps under concurrency (locked sequence)

### INV-API-2 — ZATCA onboarding, signing & reporting
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-PAY-05 · depends: INV-API-1 · labels: needs-client, security`

**What:** report every invoice to ZATCA.

**Output:** a CLI to generate the CSR and run the onboarding (compliance CSID → compliance invoices → production CSID), with credentials stored in the secret manager; XAdES signing (ECDSA secp256k1) of each invoice; a reporting queue (BullMQ) calling the reporting API within minutes and well inside 24 h, with retries, error classification, admin alerts on rejection, and a re-submit tool; an admin invoices list with status and a download

**Where:** `services/api/src/integrations/zatca/`, `services/api/src/cli/zatca-onboard.ts`

**Acceptance:**
- [ ] Sandbox: invoices and credit notes are reported with status `REPORTED`
- [ ] A rejected invoice raises an admin alert and can be fixed and re-submitted

### INV-MOB-1 — Mobile & web: invoice download
`type: Feature · area: mobile · size: XS · prio: P0 · reqs: FR-PAY-05 · depends: INV-API-1, ORD-MOB-2, ORD-WEB-2`

**What:** customers get their invoice.

**Output:** a "Download invoice" action on the order detail in the app (opens/shares the PDF) and on the web order page
**Where:** `apps/mobile/lib/features/orders/`, `apps/web/src/app/[locale]/(account)/orders/[id]`

**Acceptance:**
- [ ] The PDF opens on iOS and Android, and from the web page

## EPIC RAT — Ratings & reviews
- reqs: FR-RAT-01, FR-RAT-02
Post-delivery ratings for the order, vendor and delivery, with averages and moderation.

### RAT-API-1 — Ratings API & moderation
`type: Feature · area: api · size: S · prio: P1 · reqs: FR-RAT-01, FR-RAT-02 · depends: ORD-API-2, NOT-API-1`

**What:** collect and show ratings.

**Output:** `Rating` (orderId unique, orderStars, vendorStars, deliveryStars?, comment?, isHidden); `POST /v1/customer/orders/:id/rating` (only delivered/collected, once); aggregates (`ratingAvg`, `ratingCount`) on vendor and product (products in the order), updated transactionally; a push asking for a rating 2 h after delivery; `GET /v1/public/stores/:slug/reviews`; admin `GET /v1/admin/ratings`, `POST …/hide|unhide`

**Where:** `services/api/src/modules/ratings/`

**Acceptance:**
- [ ] Hidden comments disappear publicly, but the stars still count in the average

### RAT-MOB-1 — Mobile & web: rate order, show ratings
`type: Feature · area: mobile · size: M · prio: P1 · reqs: FR-RAT-01, FR-RAT-02 · depends: RAT-API-1, ORD-MOB-2, ORD-WEB-2`

**What:** customers rate, and everyone sees averages. This covers both customer clients to keep it in one task.

**Output:** mobile rating sheet (from the push and from the order detail), stars on product cards, store header and product detail, reviews list on the store page; the same rating form and display on the web order and store pages (`apps/web`)

**Where:** `apps/mobile/lib/features/ratings/`, `apps/web/src/features/ratings/`

**Acceptance:**
- [ ] The rating prompt doesn't appear again after rating or after dismissing twice

### RAT-DSH-1 — Dashboard: ratings moderation
`type: Feature · area: dashboard · size: XS · prio: P1 · reqs: FR-RAT-02 · depends: RAT-API-1`

**What:** hide abusive comments.

**Output:** `/admin/ratings` list with filters (vendor, stars, has comment) and hide/unhide
**Where:** `apps/dashboard/src/app/[locale]/admin/ratings`

**Acceptance:**
- [ ] Hiding is audited

## EPIC CMS — Marketing content
- reqs: FR-ADM-09
Banners, pop-ups and static pages (terms, privacy, FAQ) managed from the dashboard.

### CMS-API-1 — Banners, pop-ups & static pages API
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-ADM-09, FR-CAT-01 · depends: FND-API-4, CAT-API-5`

**What:** content the marketing team controls, plus the legal pages (terms, privacy) needed for launch and store review.

**Output:** `Banner` (imageAr, imageEn, target product|category|store|url|occasions|visits|feed, targetId, startsAt, endsAt, sortOrder, isActive), `Popup` (content, image, target, frequency once|daily|every_open, audience all|new), `StaticPage` (slug terms|privacy|faq|about, contentAr/En markdown, version); admin CRUD under `/v1/admin/cms/*`; public `GET /v1/public/cms/popups`, `/v1/public/pages/:slug`; `home` returns active banners

**Where:** `services/api/src/modules/cms/`

**Acceptance:**
- [ ] Scheduled banners appear and disappear on time (Riyadh time)

### CMS-DSH-1 — Dashboard: content management
`type: Feature · area: dashboard · size: M · prio: P0 · reqs: FR-ADM-09 · depends: CMS-API-1`

**What:** manage banners, pop-ups and pages.

**Output:** `/admin/marketing/banners` (drag reorder, schedule, AR/EN images, target picker), `/admin/marketing/popups`, `/admin/content/pages` (markdown editor with preview)
**Where:** `apps/dashboard/src/app/[locale]/admin/{marketing,content}`

**Acceptance:**
- [ ] A banner saved here shows on the staging home screen

### CMS-MOB-1 — Mobile & web: banners, pop-ups & static pages
`type: Feature · area: mobile · size: S · prio: P0 · reqs: FR-ADM-09 · depends: CMS-API-1, STF-MOB-1, STF-WEB-1`

**What:** render managed content in both customer clients.

**Output:** banner targets routed in the app and web, a pop-up with frequency stored locally, static pages screens (app) and `/[locale]/pages/[slug]` routes (web, SSR)

**Where:** `apps/mobile/lib/features/cms/`, `apps/web/src/app/[locale]/pages/[slug]`

**Acceptance:**
- [ ] A "once" pop-up never shows twice on the same device

## EPIC VIS — Farm visits & animal selection
- reqs: FR-VIS-01, FR-VIS-02, FR-VIS-03, FR-VIS-04, FR-VIS-05, FR-VIS-06, FR-VND-05
Book a visit at Jazlah or a partner farm, choose an animal on site, reserve it with a deposit, then schedule slaughter or link it to an occasion.

### VIS-API-1 — Visit slots, bookings & fees
`type: Feature · area: api · size: L · prio: P0 · reqs: FR-VIS-01, FR-VIS-02, FR-VIS-03, FR-VIS-06 · depends: VND-API-2, NOT-API-1, PAY-API-1`

**What:** schedule visits.

**Output:**
- Settings `visits.defaultSlots` (weekly template: day → [{start, end, capacityGroups}]); `VendorVisitOverride` (vendorId, date or weekday, slots[] or closed); `VisitBooking` (userId, vendorId, date, slotStart, visitors, status booked|checked_in|completed|cancelled|no_show, feeHalalas, feePaymentId?, feeCreditAvailable)
- `GET /v1/public/vendors/:id/visit-slots?from&to` (only vendors with `visitsEnabled`), `POST /v1/customer/visits {vendorId, date, slotStart, visitors}` (pays the vendor's optional `visitFeeHalalas` via payments, purpose `visit_fee`), `GET` list/detail (farm location + directions URL), `POST …/cancel` (fee refund rule: free up to 24 h before)
- Vendor: `GET /v1/vendor/visits`, `PUT /v1/vendor/visit-slots` (overrides, close days), `POST /v1/vendor/visits/:id/check-in|no-show`; realtime `visit.booked` to `vendor:{id}`; reminders 24 h and 2 h before (push)

**Where:** `services/api/src/modules/visits/`

**Acceptance:**
- [ ] e2e: a slot at capacity → `SLOT_FULL`; a closed override hides the slots
- [ ] The vendor sees a new booking in real time

### VIS-API-2 — Reserved animals: registration, deposit, scheduling
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-VIS-03, FR-VIS-04, FR-VIS-05 · depends: VIS-API-1, OCC-API-1`

**What:** the animal chosen during a visit becomes the customer's.

**Output:** `ReservedAnimal` (bookingId, vendorId, userId, productId, sizeId, tagNumber, photoMediaId?, agreedPriceHalalas, depositHalalas, status reserved|deposit_paid|scheduled|slaughtered|cancelled, orderId?, occasionRequestId?); vendor `POST /v1/vendor/visits/:id/animals`; customer `GET /v1/customer/animals`, `POST …/:id/pay-deposit` (purpose `animal_deposit`, with the visit fee credited if the vendor allows it), `POST …/:id/schedule {date, cutId, packagingId, exclusionIds, fulfilment}` → creates a carcass `Order` via `OrdersService.createOrder` (source `animal`) priced at the agreed price minus deposit and credit, or `POST …/:id/link-occasion {occasionRequestId}`

**Where:** `services/api/src/modules/visits/`

**Acceptance:**
- [ ] e2e: register → deposit (visit fee credited) → schedule → order total = agreed − deposit − credit

### VIS-DSH-1 — Dashboard: vendor visits & admin default slots
`type: Feature · area: dashboard · size: M · prio: P0 · reqs: FR-VND-05, FR-VIS-02, FR-VIS-04, FR-ADM-08 · depends: VIS-API-2`

**What:** vendors run visits; admins set the defaults.

**Output:** `/vendor/visits`: calendar of bookings, slot overrides and closed days, booking detail with check-in/no-show, a "register animal" form (product/size, tag number, photo, agreed price, deposit); vendor setting for visit fee and fee credit; `/admin/settings/visits` default weekly slots editor + visits overview

**Where:** `apps/dashboard/src/app/[locale]/vendor/visits`, `apps/dashboard/src/app/[locale]/admin/settings/visits`

**Acceptance:**
- [ ] A registered animal appears in the customer's app immediately

### VIS-MOB-1 — Mobile: visit booking & my animals
`type: Feature · area: mobile · size: L · prio: P0 · reqs: FR-VIS-01, FR-VIS-05, FR-VIS-06 · depends: VIS-API-2, VIS-DSH-1, OCC-DES-1, PAY-MOB-1`

**What:** customers book visits and follow their reserved animals.

**Output:** `features/visits`: vendors offering visits, day → slot → visitors, fee payment, booking detail (map, "Directions" opening Google/Apple Maps, cancel), reminders deep link; "My animals": card with tag and photo, pay deposit, schedule slaughter (day picker from the scheduling engine, cut/packaging) or link to an occasion

**Where:** `apps/mobile/lib/features/visits/`

**Acceptance:**
- [ ] The full visit → animal → order flow works on staging

### VIS-API-3 — Visit fees & animal deposits in finance and the e2e journey
`type: Feature · area: api · size: M · prio: P0 · reqs: FR-VIS-03, FR-VIS-05, FR-ADM-06, FR-VND-06 · depends: VIS-API-2, FIN-API-2`

**What:** money from visits reaches vendor earnings, and the visit journey is tested end-to-end.

**Output:** vendor ledger entries for visit fees (when the visit is completed or the fee is not credited) and animal deposits (as part of the order once scheduled, or kept per the cancellation rule), included in payouts and reports; `services/api/test/journeys/visit-animal-order.e2e-spec.ts`

**Where:** `services/api/src/modules/finance/`, `services/api/src/modules/visits/`, `services/api/test/journeys/`

**Acceptance:**
- [ ] Ledger and payout totals include visit fees and deposits with no double counting when a deposit becomes part of an order
- [ ] The visit → animal → deposit → order journey passes in CI

### VIS-WEB-1 — Web: visit booking & my animals
`type: Feature · area: web · size: M · prio: P1 · reqs: FR-VIS-01, FR-VIS-05, FR-VIS-06 · depends: VIS-API-2, ORD-WEB-1`

**What:** farm visits on the website.

**Output:** `/[locale]/visits` (vendors offering visits, booking, detail with map and directions), my animals (deposit, schedule slaughter, link to occasion)

**Where:** `apps/web/src/app/[locale]/(services)/visits`

**Acceptance:**
- [ ] Playwright: visit booking on staging

## EPIC REL — Releases & merge points

### REL-INF-6 — Release v0.6.0 (Sprint 6 merge point, feature freeze)
`type: Task · area: infra · size: XS · prio: P0 · depends: FED-MOB-1, CHT-MOB-1, FED-DSH-1, INV-API-2, INV-MOB-1, VIS-MOB-1, VIS-WEB-1, RAT-MOB-1, CMS-MOB-1`

**What:** close Sprint 6 and freeze the launch scope.

**Output:** `release/v0.6.0` → `main`, tag, back-merge, mobile staging build to the client, STATUS.md updated with a "launch scope frozen" note

**Where:** git, `docs/delivery/STATUS.md`

**Acceptance:**
- [ ] Exit criteria demoed and ticked; any open launch features explicitly moved or descoped with the client
