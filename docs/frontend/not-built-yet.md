# Not built yet: what the designs show that the API does not have

The designs cover the whole product, but the API is built in steps. **If a screen needs something listed here, there is no endpoint for it yet.** Build the screen against static data or a feature flag, keep its data layer behind an interface, and wait for the endpoint to appear in `openapi.json`. Never call an endpoint that `openapi.json` does not have, and never guess its shape.

## Built today

Everything in `openapi.json`, which is:
- **Sign-in and sessions:** all four audiences.
- **Customers:** the profile, marketing consent, addresses (each with `isCovered`) and account deletion.
- **Coverage zones:** the admin's zones (polygons) and the public coverage check ([coverage.md](coverage.md)).
- **Vendors:**
  - applications (with city, optional VAT number and the optional document kinds) and their review;
  - the vendor profile: logo, cover photo, description, contact phone and email, VAT number;
  - suspension and commission;
  - admin search by store name or registration number, and the city filter;
  - the public vendor list.
- **Catalog:**
  - reference lists (categories with an image) and incompatibilities, and the vendor's read-only pickers;
  - vendor and admin products, review and change requests;
  - prices (sizes, cutting styles and packagings), availability and fulfilment;
  - public browsing, with text search; the product page with its availability (also when out of stock), each size's availability and id, the default size, every cut's name, and the incompatible pairs among its options.
- **Uploads:** for every audience that has a purpose.
- **Input:** a NUL character (`\u0000`) in any text field, query or path is refused as `VALIDATION_FAILED` (`hasNoNulCharacter`). Strip control characters from pasted text in the app anyway.

The batch of API changes decided after the design comparison (issue #243) is built: none is "coming next" any more. The guides describe each where it belongs ([vendors.md](vendors.md), [catalog.md](catalog.md), [uploads.md](uploads.md)). **One change breaks the earlier shape:** a product's `packagings` is now `[{ packaging, extraPriceHalalas }]` everywhere; regenerate your client.

## Later (recorded, not scheduled)

- Ratings and reviews, loyalty points, stories and banners, Eid al-Adha campaigns.
- Store opening hours and an open or closed status, a minimum order, delivery time estimates.
- Per product: preparation time and availability by weekday.
- Itemised rejection feedback (per field), and re-uploading a single document of an application.
- Vendor invitations, exports, and product counts in admin lists.

## Not built: the order side of the product

The Sprint 3 contract (cart, checkout, payments, orders, settings, coupons, wallet) is in `openapi.json` and [orders.md](orders.md); its routes answer NOT_IMPLEMENTED until each task lands. The rows below say what is still missing beyond it.

| Area | What the screens may show | Status |
|---|---|---|
| **Cart** | Adding a product with a size, cutting, packaging and exclusions; the cart badge; preparation notes on a cart line | not built |
| **Checkout** | Address choice, delivery slot, totals with VAT, payment method; the complete-profile check and the address lock at checkout | not built |
| **Orders** | Order list and detail, statuses, cancellation, re-order; the vendor's and kitchen's order queues | not built |
| **Payments** | Card payment (Geidea), Apple Pay, cash on delivery, BNPL (instalments) | not built |
| **Delivery and scheduling** | Slots and capacity, Eid days, driver tracking (coverage zones are built) | not built |
| **Refunds and wallet** | Refunds, partial refunds, weight adjustments, wallet balance | not built |
| **Finance** | Vendor statements, payouts, commission reports | not built |
| **Invoices** | VAT invoices (ZATCA e-invoicing) | not built |
| **Notifications** | Push notifications, notification list, notification settings; SMS other than the sign-in code | not built |
| **Kitchen dashboard** | Everything except sign-in, `GET /v1/kitchen/me` and sign-out | not built |
| **Staff management** | Granting or removing vendor staff, kitchen or admin access from a dashboard; disabling a user | not built (the first admin is created by a backend command) |
| **Sessions** | A list of the user's devices and sessions | not built (`logout-all` exists) |
| **Realtime** | Live updates (order status, new order alerts) | not built |
| **Customer website extras** | Anything beyond what the customer app uses | not built |

## Requested by the apps (dashboard)

What a built dashboard screen needs and the API does not give yet. Until it lands, the screen uses the workaround in the last column. When one is built, delete its row in the same pull request.

| Gap | Needed by | Today | Issue |
|---|---|---|---|
| Staff display name on `GET /v1/admin/me`, `GET /v1/vendor/me` and `GET /v1/kitchen/me` | Dashboard top bar (name and avatar initial) | The masked phone and a user icon (agreed difference, [signoff](../design/signoff.md#agreed-build-differences-dashboard-2026-11-19)) | none open yet |
| Admin permissions on `GET /v1/admin/me` | Dashboard admin side menu: show only the allowed items; the denied screen | Every item shown; the API refuses what is not allowed | #111 (ADM-API-1) |
| The panels a phone can open, after the code is verified | Dashboard panel picker | Lists only the panels with a live session, so it appears after the second sign-in | none open yet |
| A defined client-address header on staging and production, with the API trusting the dashboard as one proxy hop | Per-address sign-in limits for staff ([dashboard README](../../apps/dashboard/README.md)) | Nothing forwarded until the deployment sets it | #8 (FND-INF-5) |
| Business type (butchery, slaughterhouse, farm), contact email, district and address details in `SubmitVendorApplicationDto` | Vendor application, business details and location steps (410:39654, 410:40011) | Business type chosen on the page only, never sent; email, district and address shown disabled | none open yet (API gap) |
| Logo and cover in the vendor application | Vendor application, photos and review step (410:40094) | Shown disabled; the vendor adds them in the store profile after approval | none open yet (API gap) |
| Commission in `GET /v1/customer/vendor-applications/latest` (approved) | Application status, approved (410:40259) | Commission row left out; only the payout row shows | none open yet (API gap) |
| Applicant email in the application answer | Application status, pending text «we send the result to your email» (410:40216) | Generic text without the email | none open yet (API gap) |
| Store tagline, street address, working hours (weekly editor), pickup and visits toggles in the vendor profile | Store profile (131:24074) | Tagline, address (shows the city) and the hours switches shown disabled; pickup and visits not shown (no frame) | Working hours (weekly), pickup with its instructions and the visits switch: API leftover of VND-API-2 #44 (closed), which specified them on the vendor store endpoint; to raise with the API owner. Tagline and street address: no owning task yet, to raise with the API owner |
| Store name change by the vendor | Store profile, validation frame (131:24427) | Read-only: only an admin changes the name (API rule), so the name error of the frame cannot occur | by design |
| A public store page URL to link to (`GET /v1/public/vendors/{id}` exists, but there is no customer website: the store is seen in the customer app) | Store profile «preview the public store page» (VND-DSH-1 output) | No preview link | No owning task yet (a store link that opens the store in the customer app); to raise with the API owner |
| Vendor support contact (phone, email or chat) | Application status «contact vendor support», store bank and suspended notes | Plain text, no link | none open yet |
| Product count per vendor in `GET /v1/admin/vendors` | Admin stores list, «products» column (131:16744) | A dash | none open yet (API gap) |
| Category filter, application-date filter, export and «invite vendor» on the admin stores list | Admin stores list (131:16744) | Shown disabled | none open yet (API gap) |
| A city filter on `GET /v1/admin/vendor-applications`, and a list of cities | Admin stores list, «pending» tab with the city filter (131:18192) | Applications: the city is filtered on the loaded page only; cities are a fixed list of 12 main cities on the page | none open yet (API gap) |
| «Ask for a new upload» of one document, and a per-document «matches» record | Vendor review documents viewer (131:18512) | «New upload» disabled (reject with a reason instead); «matches» is a mark on the page only, not saved; the review checklist is not saved either | none open yet (API gap) |
| Business activity, responsible person and street address of an application | Vendor review, store details and location (131:18512) | Activity left out; the account holder shown as the person; the city under the map | none open yet (API gap) |
| Document content type (and page count) on the document links | Vendor review viewer «page 1 of 2» (131:18512) | Shown as an image; a file the browser cannot show (PDF) offers «open the file»; no page count | none open yet (API gap) |
| Admin permissions (onboarding officer) | Not-allowed states of the stores list and review (131:17922, 131:18972) | The pages show it on PERMISSION_DENIED (403) and keep the session; no API route returns it yet, so only the mock shows it (an admin access token ending in `-limited`). The real trigger comes with ADM-API-1 | #111 (ADM-API-1) |
| Per-product cut × packaging compatibility. The rules are global (`/v1/admin/cutting-packaging-incompatibilities`); since 2026-11-21 they limit what a customer may choose (the public product's `incompatiblePairs`, refused at the cart with INCOMPATIBLE_CUTTING_PACKAGING) and no longer block publishing, so the exit criterion works with global rules. A rule only one product follows is not built | Product form, compatibility matrix (131:35405) | The matrix edits the global rules (admin) and marks in red a forbidden pair the product offers | none open yet (decision for the owner: global rules or per-product) |
| Product count per category on `GET /v1/admin/lists/{list}` (categories) | Categories table, «products» column (131:19875) | A dash | none open yet (API gap) |
| A category slug | Categories table and dialog, «link» (131:19875, 131:21038) | The English name is shown and edited in its place | none open yet (API gap) |
| Deleting a category or a product | Categories CRUD; product form «delete product» (131:35405) | Categories are switched off instead (API rule: entries are never deleted); «delete product» shown disabled | by design (lists); products: no owning task yet, to raise with the API owner |
| A bulk reorder of categories | Categories «reorder» | One `PATCH …/categories/{id}` with `sortOrder` per moved category | none open yet (works as is) |
| Search, category and date filters on `GET /v1/admin/products`, and `updatedAt` on the product card | Products list (131:21286, 131:22654) | Search and category apply to the loaded page only; the date filter is disabled; the date column shows the creation date («added on») | No owning task yet (server-side search, category and date filters on the admin product list); to raise with the API owner |
| Product SKU, order type («slaughtered on order»), minimum quantity, preparation time, order days, daily quantity, pause-until date and «featured» | Product form, basics, fulfilment and availability (131:35405); CAT-DSH-1 output (orderType, featured) | SKU left out (the meat type takes its place); the others shown disabled; «featured» not shown (no frame) | Order type and «featured» (`orderType`, `isFeatured` on the product): API leftover of CAT-API-1 #48 (closed), which specified them; to raise with the API owner. SKU and the rest: no owning task yet, to raise with the API owner |
| Packagings «chilled carton» and «gift wrap» of the frame | Product form, packaging (131:35405) | The API's four: vacuum bag, chilled tray, bags, no packaging | none open yet (API decision) |
| Admin permissions (catalog manager) | Not-allowed states of categories, products, the product form and the review queue (131:20824, 131:22394, 131:37786, 131:23693) | The pages show it on PERMISSION_DENIED and keep the session; only the mock answers it until ADM-API-1 (an access token ending in `-limited`) | #111 (ADM-API-1) |
| A cover image on the items of `GET /v1/admin/review-queue`, and an edit's proposed name | Review queue rows (131:22954) | The row shows the image placeholder and the live name; the dialog reads the product and shows the proposal | none open yet (API gap) |
| The kind of a change request (images, description, price…) | Review queue «request type» badges «تعديل صور», «تعديل سعر» (131:22954) | One «product edit» badge; the dialog lists the changed parts by comparing the request with the live product. Price edits never reach review (they apply at once) | none open yet (API gap) |
| Decided change requests, and the review date on the product card | Review queue «approved» and «rejected» tabs (131:22954) | The tabs list vendors' published and rejected products (creation date); decided edits are not listed | none open yet (API gap) |
| A list of review notes (title, body, the part to fix) instead of one reason | Rejection notes (131:38124) | One note card with the admin's reason; its button opens the form | none open yet (API gap) |
| Submission count of a product | Rejection notes «محاولات الإرسال» (131:38124) | Row left out | none open yet (API gap) |
| Search, category, availability and date filters on `GET /v1/vendor/products`, `updatedAt` on the card, a rejected count | My products (131:25074, 131:26222) | Search, category and availability apply to the loaded page; the date filter is disabled; the date column shows the creation date; the notice counts the first 50 rejected products | none open yet (API gap) |
| A vendor-session state for a store not yet approved | My products «store under review» (131:26015) | A vendor session exists only after approval (applicants use the customer session and `/vendor/application`). The frame's layout is shown with a suspended store's copy when the vendor routes answer VENDOR_SUSPENDED (on the mock: an access token ending in `-suspended`) | none open yet (API decision) |
| Platform weekly working hours (the frame's «ساعات العمل»; not a key of `OperationsSettingsResponseDto`) (A12) | Operations settings «ساعات العمل» (118:11181) | Section left out (the Sprint 3 contract has no platform hours; the vendor's weekly hours are an API gap too, orders.md) | #68 (SCH-API-1) |
| A pause read that is never stale for the admin who changed it: the client settings may be "cached for a minute at most", and the pause route's answer is the admin's only fresh read | Admin header pause switch and banner on every admin page | The dashboard asks with `cache: no-store` and `Cache-Control: no-cache`, and for a minute after a change made in this tab it keeps its own state over the server read; another tab or a full reload may show the old state for up to a minute if a cache in front of the API ignores `no-cache` | #68 (SCH-API-1) |
| An admin view of full days across the platform (booked against capacity) | Operations calendar legend «مكتمل» (118:11181) | Legend shown, no day marked full (the capacity read is per vendor) | #69 (SCH-API-2) |
| Admin permissions (operations manager): the Sprint 3 operations and capacity routes list only FORBIDDEN for 403, which ends the session; PERMISSION_DENIED keeps it | Not-allowed state of the operations settings and capacity (118:13416) | The pages show it on PERMISSION_DENIED; only the mock answers it (an access token ending in `-limited`) | #111 (ADM-API-1) |
| Realtime `order.created` for the dashboard (the socket rooms planned with ORD-API-3, joinable by the dashboard server with the staff token) | Orders board: a new order appears without refresh | The board polls its first page every 15 s (orders.md: poll until the socket lands); the mock pushes through `/api/{admin,vendor}/orders/events` (server-sent events) | #83 (ORD-API-3) |
| Realtime `order.updated` (`{ id, status }`: a status changed elsewhere, such as a customer cancel, an expiry, a capture) | Orders board rows | Polling re-reads the first page and reloads it when a listed order's status changed | #83 (ORD-API-3) |
| Store names for the admin orders store filter | Orders board store filter | The first page of active stores from the admin vendors list | #83 (ORD-API-3) |
| **Known issue, dashboard (not an API gap).** A list's first link click can leave the page on the list: the navigation's RSC request and the target page's chunks all answer 200 and no error is logged, but the App Router does not commit the new URL within 6 s. Reproduced locally only with 6× CPU throttling (3–9 of 25 first clicks on «FALAH15», the link rendered after the list's client fetch, with the row prefetches in flight); unthrottled, 0 of 25. CI's runners hit it on coupons:89 twice in one attempt, and on orders:127 and admin-catalog:77 | Orders board, coupons and products lists (any `Link` in a freshly loaded table) | The mock specs use `follow()` (`e2e/helpers.ts`), which clicks again until the URL changes. A user who clicks once may need a second click on a slow device. Next 15.5.29; not yet traced to a cause cheap enough to fix here (candidates: a transition starved by the list's own state updates, or a race with the in-flight prefetch of the same route) | #88 |
| Orders export | Orders board «تصدير» | Shown disabled | #114 (ADM-DSH-2, Sprint 4) |
| Admin cancel & refund of an order (`{reason, refundTo: wallet\|original, amount?}`) | Order detail «إلغاء واسترجاع» (135:49317) | Not in the Sprint 3 contract: shown disabled on the API (a COD reject is the contract's move to `cancelled` with its note); the mock has it for the smoke tests | #92 (CAN-API-1, Sprint 4) |
| Admin reschedule: the days on offer for an order, and the reschedule itself (`{date}`) | Order detail «إعادة جدولة» (135:49465) | Not in the Sprint 3 contract: shown disabled on the API; the mock has it | #98 (DLV-API-1, Sprint 4); the days read has no task yet |
| Admin permissions (orders): the order routes list only FORBIDDEN for 403 | Not-allowed states of the orders board and detail (135:48887, 135:50278) | The pages show it on PERMISSION_DENIED; only the mock answers it | #111 (ADM-API-1) |
| Admin permissions (marketing): the coupon routes list only FORBIDDEN for 403 | Not-allowed state of the coupons pages | The pages show it on PERMISSION_DENIED; only the mock answers it | #111 (ADM-API-1) |
| First-order-only coupons (`firstOrderOnly`, not in the contract) | Coupon form switch «للطلب الأول فقط» | Shown disabled with «غير متاح حاليًا», never sent | by design (decision 25) |

The code length in the code request answer is asked for in the mobile section below; the dashboard needs it too (a dashboard setting today).

The dashboard's in-process mocks (staff and customer sign-in accounts, an in-memory coverage store, the operations settings and vendor capacity, orders, coupons, vendor applications and their admin review, store profile, the admin catalog with the vendor products and review queue, and a mock upload storage) exist only for its smoke tests; they stand in for nothing missing. They are compiled into development and test builds only (`DASHBOARD_TEST_BUILD=1`), never into a production build.

## Requested by the apps (mobile)

What the customer app needs from the API and does not have yet. Each row names the screen and what the app does until then. Rows marked **API gap** have no issue yet; the issue number goes here when one is opened.

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| `isLocked` on addresses (an address used by an open order) | Addresses: lock state, edit and delete disabled | Always unlocked from the API; only the mock shows a locked address | API gap (planned in ACC-API-2 #18; real rule moved from ORD-API-1 #81 to ORD-API-2 #82: an order exists now, but an address is never locked and account deletion is not blocked by open orders yet) |
| A public list of served cities (or of zones) | Location: out of coverage, "available areas" line | The line is hidden in real builds; the mock lists Riyadh, Jeddah, Dammam | LOC-API-1 #24 |
| A geocoding and place-search proxy (a public geocode route) | Location: map picker address line and search | The device calls Google Geocoding with the key from the app config. Until the proxy exists, use a **separate key restricted to the Geocoding API**, with daily quota caps and billing alerts, and keep the Maps SDK key app-restricted (owner action). In dev or with the mock switch on, the app uses sample places; real builds without a key leave the fields empty for typing | API gap |
| The app hash in the sign-in SMS, per flavor (Android SMS Retriever) | Sign-in: OTP autofill on Android (`sms_autofill`) | Keyboard suggestion only (`AutofillHints.oneTimeCode`) | API gap |
| Account counters: orders, animals, listings | Account: the stats row | Orders count the order list without cancelled orders ("—" without the orders route); addresses are real; animals and listings show "—" | Orders: ORD-API-3 #83; animals and listings with FED-MOB-1 #152; counters: API gap |
| Points balance | Account: "JAZLA points" row | No balance shown | LOY-MOB-1 #174 |
| Notification settings | Settings: order notifications switch | Stored on the device | NOT-MOB-1 #105 (API gap) |
| Support contact (public settings) | Sign-in errors `ACCOUNT_DISABLED`, `ACCOUNT_HAS_STAFF_ACCESS` | The message only, no "contact support" action | API gap |
| OTP length in the `otp/request` response (optional) | Sign-in: OTP cells | The app reads `codeLength`, default 6 | API gap |

### Catalog: home, category and store pages (STF-MOB-1 #55)

The app reads the public catalog through one repository. Categories, product lists (by category or store, cursor-paged), the store list and a store come from the public catalog routes. With the mock switch on, a seeded catalog (4 stores, 13 categories, 52 products) fills everything below; without it, each gap is hidden or empty, never invented.

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| A home feed (banners, best sellers, featured, partner stores in one call) | Home | Built from the category list and the first 3 stores; the best sellers section is hidden (no true list yet) and there are no banners | CAT-API-5 #50; banners CMS-API-1 #162 |
| A "stores near you are paused" flag | Home: closed state | Never shown from the API; the mock can show it | SCH-API-1 #68 (the public paused setting) |
| Filtering home and lists by the customer's location | Home: empty state ("no stores in your area") | Shown only when the catalog has no stores | CAT-API-5 #50 |
| Sorting product lists (best selling, price up, price down) | Category page: sort chips | Chips hidden with the API; the mock sorts | CAT-API-5 #50 |
| Store rating and rating count | Home store cards, store page | Hidden | RAT-API-1 #158 |
| Store opening hours and open/closed now | Store page: open/closed badge, closed notice, info sheet; products shown unavailable while closed | Hidden; a store is treated as open | VND-API-2 #44 (working hours in the public store) |
| Store delivery time and minimum order | Store page badges and minimum order line | Hidden | SCH-API-1 #68 (minimum order); delivery time: CAT-API-5 #50 |
| Store pickup flag | Store info sheet | Hidden | VND-API-2 #44 |
| The categories a store sells | Store page: category chips | Taken from the store's products loaded so far | CAT-API-5 #50 |
| The default size line and the "slaughtered today" tag on product cards | Product cards everywhere | Hidden (card shows vendor, name and the lowest price) | CAT-API-5 #50; slaughter time VOP-API-1 #108 |

### Product detail and customization (STF-MOB-3 #56)

The product page reads one public product (images, sizes with their availability, cuts, packagings, exclusions, description, availability, default size and the cutting and packaging pairs that cannot go together). An unavailable product opens with the unavailable notice and the add button disabled; an unavailable size shows but cannot be chosen; the default size is preselected; a packaging that does not go with the chosen cut cannot be chosen and says why. The displayed total is computed on the device by one pure function with the server's formula, its errors in the order of the fixture and the server's price-line.ts (each once, in the order found: SIZE_UNAVAILABLE comes before an unknown cut, packaging or exclusion), and the app's tests run every case of [fixtures/pricing-cases.json](fixtures/pricing-cases.json) against it; the server stays authoritative in the cart. With the mock switch on, every seeded product has options (the Al Falah ribeye matches the design option for option, one product per store is out of stock, one carcass has a sold-out size).

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| Slaughter time and chilled delivery window | Product: freshness card | Hidden | VOP-API-1 #108, DLV-MOB-1 #101 |
| Store rating in the product | Product: rating next to the store name | Hidden | RAT-API-1 #158 |
| A gift box packaging | Product: packaging list (the design shows one) | The API knows trays, bags, vacuum and none; only the mock offers a gift box | No task yet: an API decision on the packaging list (raised in CAT-API-1 #48) |
| Server price for a product line | Product: total and price details | Computed on the device by the same function, errors in the fixture's and price-line.ts's order, proven on the shared cases; no route prices a single line: the cart returns the server's prices | CRT-API-1 #61 |
| A design for the fulfilment badge (delivery, pickup or both) | Product: the badge the task Output asks for | The value is read from the product and kept, nothing is drawn until the badge is designed | Design gap |
| "Notify me when back in stock" (stock alerts) | Product: out-of-stock notice | The notice says only that the product is unavailable; the design's "you can ask to be notified" sentence is left out until the feature exists | No task yet: stock alerts are not in the plan (NOT-API-1 #104 would send them) |

### Cart (CRT-MOB-1 #64)

Real builds use the contract routes (#314, [orders.md](orders.md)) through the generated client; until a route's task lands it answers NOT_IMPLEMENTED (501) and the screen says «قريبًا» (mapped once, in the shared error text). The cart follows the CRT-API-1 / CRT-API-3 shapes of sprint-3.md (lines with the unit price when added, totals subtotal, discount, delivery fee, total, VAT included, minimum order, minimum-order remaining, can-checkout and issues). The account cart's lines and totals are the server's; a guest's cart is priced on the device with the app's one price function. A guest's cart is kept on the device and merged into the account cart after sign-in (merge route with the guest lines; same store or an empty account cart sums the same choices, another store is replaced and the user is told, lines that cannot be bought are skipped and counted). With the mock switch on, an in-memory account cart applies the server rules, re-prices against the mock catalog on every read, and uses a minimum order of 100.00 and a delivery fee of 15.00. Mock coupons: JAZLA10 (10%, valid), EID25 (expired), BIG50 (minimum order 300.00), FALAH15 (Al Falah only), WELCOME5 (limit reached); any other code is not found.

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| The cart routes (read, add with replace, change, remove, merge with its merge id, coupons) | Cart; product «أضف إلى السلة»; header badge; sign-in merge | Wired to the contract; a guest's cart stays on the device until sign-in, then merges once with its merge id. The route answers 501 until it lands | CRT-API-1 #61, CRT-API-3 #62 |
| Coupon details still open (lead review A10): the code for a scheduled or inactive coupon, the rounding of a percent discount | Cart: coupon field | The mock answers not found for an inactive coupon and not applicable for a scheduled one and floors the percent; real builds show the server's code | CRT-API-3 #62 |
| **For Kerolles:** the first-order-only coupon (the mock's FIRST15) has no code in the contract | Cart: coupon field | The mock answers not applicable | CRT-API-3 #62 |

### Checkout step 1: method, address and day (SCH-MOB-1 #71)

Real builds use the contract routes (#314, [orders.md](orders.md)) through the generated client; until a route's task lands it answers NOT_IMPLEMENTED (501) and the screen says «قريبًا» (mapped once, in the shared error text). The screen follows the SCH-API-1 / SCH-API-2 shapes of sprint-3.md: the public client settings (only the pause is read here: is paused, Arabic and English message), the days for a method (date, available, reason one of past cutoff, closed, full, outside horizon, vendor closed, and the window), the fulfilment save (method, address id for delivery, date) with its four error codes (fulfilment not supported, address not covered, day full, ordering paused), and the pickup point in the cart answer (store name, address, map point, opening and closing time, instructions). Dates and times are shown as the server sends them (Riyadh) and never converted with the device time zone. The app does not compute days: with the mock switch on, an in-memory scheduler applies the SCH-API-1 defaults in Riyadh time with an injectable clock (ready meat 12:00 same day, carcass 20:00 one day ahead, cooked 18:00 one day ahead, occasion three days ahead; a mixed cart takes the strictest), a 14-day horizon (the day after it is sent as outside horizon), a closed day for both methods three days ahead, a closed delivery-only day five days ahead, a full day two days ahead, pickup closed on Fridays, a 16:00 to 22:00 window, and delivery-only or pickup-only items refused for the other method. **QA pause switch:** run with the define MOCK_PAUSED set to true.

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| The client settings, days and fulfilment routes | Checkout: paused banner, day strip, calendar, window, «متابعة إلى الدفع» | Wired: the days are asked again (PATCH the fulfilment, then GET the days) when the method or the address changes; a disabled day says the contract's reason. The routes answer 501 until they land | SCH-API-1 #68, SCH-API-2 #69 |
| **For Kerolles:** the pickup point only comes in the cart answer after the fulfilment is saved | Checkout pickup card (name, map, «اتصال بالمتجر», «الاتجاهات») before «متابعة إلى الدفع» | Before the save the card says pickup is ready at the store without its address and buttons; after it (and on the order) the store phone and directions show. Ask: the store's pickup point (name, address, location, phone, hours) in the cart answer whenever the cart has a store that offers pickup | SCH-API-2 #69 |
| **For Kerolles:** pickup instructions and the vendor's weekly hours are not in the pickup point | Checkout pickup card | Instructions hidden; the chosen day's hours are shown | SCH-API-2 #69 |
| A text for vendor closed and outside horizon days, and the closed day reason text | Checkout: reason card and key | The app's own texts for the two reasons Figma does not draw; the closed day reason text is not in the day answer, so the card says «مغلق: عطلة المتجر» | SCH-API-2 #69 |

### Review and place order (ORD-MOB-1 #84)

Real builds use the contract routes (#314, [orders.md](orders.md)) through the generated client; until a route's task lands it answers NOT_IMPLEMENTED (501) and the screen says «قريبًا» (mapped once, in the shared error text). The «الدفع والمراجعة» screen follows the ORD-API-1 and PAY-API-1 shapes of sprint-3.md. It shows the cart (lines, totals with VAT, the fulfilment chosen at step 1, with the day's window from the days route), the payment methods the order may use (each with available and a reason), and places the order with one idempotency key per checkout attempt (a retry or a double tap sends the same key). The answer is the order and the payment's next action: an order to pay goes to the payment step (PAY-MOB-1 #78); an order with nothing left to pay (cash on delivery, wallet only) opens «تم استلام طلبك». Refusals send the customer back: day full, address not covered, fulfilment not supported and ordering paused to checkout step 1 (days, address book or pause asked again); price changed, item unavailable, minimum order not met and the five coupon codes to the cart (re-read, so its banners say why). With the mock switch on, an in-memory placement re-checks the pause, the prices, the minimum order, coverage and the day, snapshots the lines (names in Arabic and English, prices from the cart), numbers the order JZ-YYMMDD-XXXX in Riyadh time (injectable clock), sets pending payment for mada, card and Apple Pay and new for cash on delivery and wallet, answers the same order for the same key, and clears the cart. Mock payment methods: a saved mada card ending 4821, Apple Pay, the wallet with 50.00 (disabled with «الرصيد غير كافٍ» when it does not cover the total) and cash on delivery up to 1,000.00 (left out above it or when switched off, as PAY-API-1 says). After a failure that may have created the order (no answer), the method is locked so the retry with the same key cannot differ, and the order placed screen shows the order's own method. No notes field: Figma has none and each cart line already carries its preparation notes.

| What the app needs | Screen | Today | Issue |
|---|---|---|---|
| The place order and payment methods routes | Review: «طريقة الدفع», «تأكيد الطلب»; order placed | Wired: one `Idempotency-Key` per attempt (a double tap sends one POST, a retry the same key); PROFILE_INCOMPLETE opens the profile, PAYMENT_METHOD_NOT_AVAILABLE and WALLET_INSUFFICIENT read the methods again. The routes answer 501 until they land | ORD-API-1 #81, PAY-API-1 #76 |
| **For Kerolles:** saved cards (last four digits) on the payment methods answer | Review: «طريقة الدفع» (the design's «مدى •••• 4821») | Methods without a card number; the order's card number shows once paid (`payment.cardLast4`) | PAY-API-1 #76 |
| Points earned and the delivery story share | Order placed: «كسبت 338 نقطة», «انشر قصة استلامك» | Left out | LOY-MOB-1 #174, STY-MOB-1 #177 (Sprint 6) |

### Payment step (PAY-MOB-1 #78)

Real builds use the contract routes (#314, [orders.md](orders.md)) through the generated client; until a route's task lands it answers NOT_IMPLEMENTED (501) and the screen says «قريبًا» (mapped once, in the shared error text). An order waiting for payment opens the payment step, drawn as the same «الدفع والمراجعة» screen. The gateway step for the payment's next action (a redirect to the provider's hosted page) runs behind one device port, start payment: an in-app webview that closes on the return url; a gateway SDK may come behind it in PAY-MOB-2 #79. No new payment is started while the latest one may still capture (the button then reads «تحقق من حالة الدفع», and «متابعة الدفع» reopens the same hosted page when the app still holds its next action; reopened from a cold start it does not, as the order answer carries no next action), and after a network error the methods stay frozen so the retry sends the same key and body. Its result only says the step ended or was closed. The outcome is always read from the order's status on the server (order status plus the latest payment status), polled every 2 seconds while a payment is in flight (for about 60 seconds; then the screen says the payment is still processing and lets the customer leave), read once when the step is closed, and read again when the app resumes or the screen is opened again. The order id is kept on the device while its payment is open (cleared on the outcome, on leaving after a decline, and with the account data on sign-out), so a cold start after the app was killed mid-payment opens the payment step again and shows the outcome. A retry keeps its payment idempotency key until the server answers it. Paid goes to «تم استلام طلبك». Declined shows the bank's refusal with «إعادة المحاولة»: the retry is a new payment on the same order with a new payment idempotency key, and the customer may choose another method, including cash on delivery. Cancelled by the 15-minute timeout shows that the order was cancelled and goes to the cart. The wallet part of the tender plan is a switch on the review screen and is sent at placement (the wallet is debited in the order transaction); wallet only confirms the order without the gateway. Cash on delivery lands as new (review) or confirmed (auto) and the placed screen says which.

With the mock switch on, the mock order server keeps each order's payments. The fake provider's hosted page (a sheet with «موافقة», «رفض» and «إلغاء الدفع», closable) records the choice on it, the way the provider's webhook would, and redirects to the return url. Amounts ending in 13 halalas are always declined. A capture confirms the order. A decline gives the wallet part back (the retry then charges the whole total). An unpaid order is cancelled 15 minutes after it was created on the injectable Riyadh clock, giving the wallet part back; late decisions are ignored. Wallet balance 50.00; cash on delivery confirmation is review.

| What the app needs | Screen | Today | Issue |
|---|---|---|---|
| The payments route and the order read | Payment step | Wired: `POST /orders/{id}/payments` with its own key, `nextAction` redirect in the webview, PAYMENT_IN_PROGRESS re-reads the status, the outcome from `GET /orders/{id}` (also on a cold start). The routes answer 501 until they land | PAY-API-1 #76, ORD-API-3 #83 |
| A wallet part on a payment retry (an app limit: the methods route is asked with `?orderId=`) | Payment step: «طريقة الدفع» | No wallet part offered on a retry yet; the retry charges what is left | PAY-MOB-1 #78 |
| The live gateway (mada, cards, Apple Pay) | Payment step | Real builds open the hosted page in the webview; a native SDK can come behind the same port | PAY-MOB-2 #79 |

### My orders and order detail (ORD-MOB-2 #85)

Real builds use the contract routes (#314, [orders.md](orders.md)) through the generated client; until a route's task lands it answers NOT_IMPLEMENTED (501) and the screen says «قريبًا» (mapped once, in the shared error text). The orders tab and the order detail follow the ORD-API-3 shapes of sprint-3.md: the customer order list by scope (current, past; «الكل» asks for both), and one order with its items (names, size, cut, notes, line totals), totals, payment, status history and what the customer may do. Statuses are ORD-API-2's; the timeline shows the time each step was reached, in Riyadh time. An unpaid order offers «إكمال الدفع» (the payment step). Live updates: the detail re-reads the order every 30 seconds while it is open and the app is in the foreground; with the mocks, the list and the detail also listen to order updated events through a realtime port (the contract has no socket yet). With the mock switch on, the orders are the ones placed in this session on the mock order server, plus two seeded past Al Falah orders (cancelled 9 days ago, delivered a week ago); a status change on the mock server (as the dashboard would make it) is recorded in the history and sent as an event.

| What the app needs | Screen | Today | Issue |
|---|---|---|---|
| The customer order list and detail routes | Orders tab; order detail | Wired (`OrderSummaryResponseDto`, `OrderResponseDto`: status, money, vendor phone and location, pickup point phone, payment, expires at); «اتصال بالمتجر» and «الاتجاهات» show with the phone and the point. The routes answer 501 until they land | ORD-API-3 #83 |
| **For Kerolles:** realtime: the contract has no socket gateway or order updated event | Order detail: live status | The detail re-reads `GET /orders/{id}` every 30 seconds while open and in the foreground (a dashboard change shows within 30 s); the realtime port stays for the mocks | ORD-API-3 #83 |
| **For Kerolles:** the order summary carries no item names, image or window | Orders: card items line, thumbnail, «اليوم، 4:00 م» | On the card the items line is hidden, the thumbnail is the placeholder and the day has no time; the detail shows them | ORD-API-3 #83 |
| **For Kerolles:** support contacts (the store phone is there; the platform's support phone or WhatsApp is not) | Order detail: «تواصل مع الدعم» | Hidden | SCH-API-1 #68 |
| A customer cancel route and «can cancel» | Order detail: «إلغاء الطلب» | Hidden | CAN-API-1 (Sprint 4) |
| Complaints | Order detail: «الإبلاغ عن مشكلة» | Hidden | CMP (Sprint 5) |
| Tracking (driver, ETA, map) and the freshness certificate | Order detail: «تتبع التوصيل», «شهادة الطزاجة»; tracking screen | The frame's own not started states before shipping; nothing after; no tracking screen | DLV-MOB-1 #101 |
| Invoice and rating | Order detail | Not shown | INV-MOB-1 #32, RAT-MOB-1 #159 |

### Search and filters (STF-MOB-4 #57)

Search reads the public product list with its words, category, store and price range, cursor-paged. Recent searches are kept on the device (8 at most, cleared on sign-out). With the mock switch on, the seeded catalog is searched on the device exactly the way the server searches (B5, 2026-11-22): every word on its own, all of them required, in any order, anywhere in the product's Arabic and English names or at the start of a word of its store's names (so «لحم» does not find every «ملحمة …» store), one-letter words ignored; words folded (no tashkeel or tatweel; أ/إ/آ/ٱ as ا; ى as ي; ة as ه; English in any case), so «نعيمى» finds «نعيمي» and "naimi" finds the English name. The words are trimmed and searched only from 2 to 100 characters (shorter text shows the start screen). Recent searches drop repeats that fold to the same words.

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| A result count (and facets per category and store) | Search results: "24 results for …"; filters sheet: "Show 24 results" | No count text; the sheet button reads "Show results" | CAT-API-5 #50 |
| Popular searches | Search start: "Most searched" | Section hidden | CAT-API-5 #50 |
| Sorting search results | Filters sheet: sort chips (the design has no sort control; added as a chip group in the sheet) | Group hidden; the mock sorts | CAT-API-5 #50 |
| An "available now only" filter | Filters sheet: switch and its chip | Switch hidden; the mock filters | CAT-API-5 #50 |
| A public list of meat types | Filters sheet: meat type (not in the design) | Not shown; the product list already accepts a meat type, so it can be added once names can be listed | CAT-API-5 #50 |
| Store names for any store id (or the whole store list in one call) | Search: store chips in the filters sheet and the active store chip | Only the first page of stores is offered; a chosen store outside it shows as a generic "Store" chip | CAT-API-5 #50 |

When one of these lands, its endpoints appear in `openapi.json`, and this file and the module guides are updated in the same pull request.
