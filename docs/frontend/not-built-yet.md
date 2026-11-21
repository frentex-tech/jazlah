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
  - public browsing, with text search.
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

None of these has an endpoint yet:

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
| A duplicate commercial registration error code | Vendor application, business details | None: the API has no such check or code; other VALIDATION_FAILED fields are mapped to their step | none open yet (API gap) |
| Store tagline, street address, working hours (weekly editor), pickup and visits toggles in the vendor profile | Store profile (131:24074) | Tagline, address (shows the city) and the hours switches shown disabled; pickup and visits not shown (no frame) | none open yet (API gap) |
| Store name change by the vendor | Store profile, validation frame (131:24427) | Read-only: only an admin changes the name (API rule), so the name error of the frame cannot occur | by design |
| A public store page URL to link to (`GET /v1/public/vendors/{id}` exists, but there is no customer website: the store is seen in the customer app) | Store profile «preview the public store page» (VND-DSH-1 output) | No preview link | none open yet (no web target) |
| Vendor support contact (phone, email or chat) | Application status «contact vendor support», store bank and suspended notes | Plain text, no link | none open yet |
| Product count per vendor in `GET /v1/admin/vendors` | Admin stores list, «products» column (131:16744) | A dash | none open yet (API gap) |
| Category filter, application-date filter, export and «invite vendor» on the admin stores list | Admin stores list (131:16744) | Shown disabled | none open yet (API gap) |
| A city filter on `GET /v1/admin/vendor-applications`, and a list of cities | Admin stores list, «pending» tab with the city filter (131:18192) | Applications: the city is filtered on the loaded page only; cities are a fixed list of 12 main cities on the page | none open yet (API gap) |
| «Ask for a new upload» of one document, and a per-document «matches» record | Vendor review documents viewer (131:18512) | «New upload» disabled (reject with a reason instead); «matches» is a mark on the page only, not saved; the review checklist is not saved either | none open yet (API gap) |
| Business activity, responsible person and street address of an application | Vendor review, store details and location (131:18512) | Activity left out; the account holder shown as the person; the city under the map | none open yet (API gap) |
| Document content type (and page count) on the document links | Vendor review viewer «page 1 of 2» (131:18512) | Shown as an image; a file the browser cannot show (PDF) offers «open the file»; no page count | none open yet (API gap) |
| Admin permissions (onboarding officer) | Not-allowed states of the stores list and review (131:17922, 131:18972) | Only on the mock (an admin access token ending in `-limited` is answered NOT_ALLOWED); the API's FORBIDDEN ends the session as `errors.md` says. The real trigger comes with ADM-API-1 | #111 (ADM-API-1) |
| Per-product cut × packaging compatibility. Today the rules are global (`/v1/admin/cutting-packaging-incompatibilities`), and a product offering a forbidden pair cannot be published (PRODUCT_NOT_SUBMITTABLE `INCOMPATIBLE_CUTTING_PACKAGING`), while the sprint exit criteria want a published product with one incompatible pair that the app blocks at selection | Product form, compatibility matrix (131:35405); Sprint 2 exit criteria | The matrix edits the global rules (admin) and marks in red a forbidden pair the product offers; such a product saves as a draft, and publishing shows the API's refusal | none open yet (API decision needed) |
| Product count per category on `GET /v1/admin/lists/{list}` (categories) | Categories table, «products» column (131:19875) | A dash | none open yet (API gap) |
| A category slug | Categories table and dialog, «link» (131:19875, 131:21038) | The English name is shown and edited in its place | none open yet (API gap) |
| Deleting a category or a product | Categories CRUD; product form «delete product» (131:35405) | Categories are switched off instead (API rule: entries are never deleted); «delete product» shown disabled | by design (lists); none open yet (products) |
| A bulk reorder of categories | Categories «reorder» | One `PATCH …/categories/{id}` with `sortOrder` per moved category | none open yet (works as is) |
| Search, category and date filters on `GET /v1/admin/products`, and `updatedAt` on the product card | Products list (131:21286, 131:22654) | Search and category apply to the loaded page only; the date filter is disabled; the date column shows the creation date («added on») | none open yet (API gap) |
| Product SKU, order type («slaughtered on order»), minimum quantity, preparation time, order days, daily quantity, pause-until date and «featured» | Product form, basics, fulfilment and availability (131:35405); CAT-DSH-1 output (orderType, featured) | SKU left out (the meat type takes its place); the others shown disabled; «featured» not shown (no frame) | none open yet (API gap) |
| Packagings «chilled carton» and «gift wrap» of the frame | Product form, packaging (131:35405) | The API's four: vacuum bag, chilled tray, bags, no packaging | none open yet (API decision) |
| Admin permissions (catalog manager) | Not-allowed states of categories, products and the product form (131:20824, 131:22394, 131:37786) | Only on the mock (an access token ending in `-limited` is answered NOT_ALLOWED) | #111 (ADM-API-1) |
| One review queue for admins (new products and edits together), with the submission date, vendor name and a count | Product review queue and the «products» side-nav badge (131:22954) | Page by page: a page is up to 20 of `GET /v1/admin/products?status=pending_review` and 20 of `GET /v1/admin/product-change-requests`, merged newest first, with each edit's product read (five at a time) for its store; the decided tabs read one page of published or rejected products and drop JAZLA's on the page; a new product is dated by its creation (no `submittedAt` on the card) and read when opened; the badge reads the first 50 of each list only («50+» beyond), kept five minutes | #52 (CAT-DSH-2, open until wired; API gap B6) |
| The kind of a change request (images, description, price…) | Review queue «request type» badges «تعديل صور», «تعديل سعر» (131:22954) | One «product edit» badge; the dialog lists the changed parts by comparing the request with the live product. Price edits never reach review (they apply at once) | none open yet (API gap) |
| Decided change requests, and the review date on the product card | Review queue «approved» and «rejected» tabs (131:22954) | The tabs list vendors' published and rejected products (creation date); decided edits are not listed | none open yet (API gap) |
| A list of review notes (title, body, the part to fix) instead of one reason | Rejection notes (131:38124) | One note card with the admin's reason; its button opens the form | none open yet (API gap) |
| Submission count of a product | Rejection notes «محاولات الإرسال» (131:38124) | Row left out | none open yet (API gap) |
| Search, category, availability and date filters on `GET /v1/vendor/products`, `updatedAt` on the card, a rejected count | My products (131:25074, 131:26222) | Search, category and availability apply to the loaded page; the date filter is disabled; the date column shows the creation date; the notice counts the first 50 rejected products | none open yet (API gap) |
| A vendor-session state for a store not yet approved | My products «store under review» (131:26015) | A vendor session exists only after approval (applicants use the customer session and `/vendor/application`). The frame's layout is shown with a suspended store's copy when the vendor routes answer VENDOR_SUSPENDED (on the mock: an access token ending in `-suspended`) | none open yet (API decision) |

The code length in the code request answer is asked for in the mobile section below; the dashboard needs it too (a dashboard setting today).

The dashboard's in-process mocks (staff and customer sign-in accounts, an in-memory coverage store, vendor applications and their admin review, store profile, the admin catalog with the vendor products and review queue, and a mock upload storage) exist only for its smoke tests; they stand in for nothing missing. They are compiled into development and test builds only (`DASHBOARD_TEST_BUILD=1`), never into a production build.

## Requested by the apps (mobile)

What the customer app needs from the API and does not have yet. Each row names the screen and what the app does until then. Rows marked **API gap** have no issue yet; the issue number goes here when one is opened.

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| `isLocked` on addresses (an address used by an open order) | Addresses: lock state, edit and delete disabled | Always unlocked from the API; only the mock shows a locked address | API gap (planned in ACC-API-2 #18; real rule with ORD-API-1 #81) |
| A public list of served cities (or of zones) | Location: out of coverage, "available areas" line | The line is hidden in real builds; the mock lists Riyadh, Jeddah, Dammam | API gap |
| A geocoding and place-search proxy (a public geocode route) | Location: map picker address line and search | The device calls Google Geocoding with the key from the app config. Until the proxy exists, use a **separate key restricted to the Geocoding API**, with daily quota caps and billing alerts, and keep the Maps SDK key app-restricted (owner action). In dev or with the mock switch on, the app uses sample places; real builds without a key leave the fields empty for typing | API gap |
| The app hash in the sign-in SMS, per flavor (Android SMS Retriever) | Sign-in: OTP autofill on Android (`sms_autofill`) | Keyboard suggestion only (`AutofillHints.oneTimeCode`) | API gap |
| Account counters: orders, animals, listings | Account: the stats row | Shows "—" (addresses are real) | Orders with ORD-MOB-2 #85; animals and listings with FED-MOB-1 #152; counters: API gap |
| Points balance | Account: "JAZLA points" row | No balance shown | LOY-MOB-1 #174 |
| Notification settings | Settings: order notifications switch | Stored on the device | NOT-MOB-1 #105 (API gap) |
| Support contact (public settings) | Sign-in errors `ACCOUNT_DISABLED`, `ACCOUNT_HAS_STAFF_ACCESS` | The message only, no "contact support" action | API gap |
| OTP length in the `otp/request` response (optional) | Sign-in: OTP cells | The app reads `codeLength`, default 6 | API gap |

### Catalog: home, category and store pages (STF-MOB-1 #55)

The app reads the public catalog through one repository. Categories, product lists (by category or store, cursor-paged), the store list and a store come from the public catalog routes. With the mock switch on, a seeded catalog (4 stores, 13 categories, 52 products) fills everything below; without it, each gap is hidden or empty, never invented.

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| A home feed (banners, best sellers, featured, partner stores in one call) | Home | Built from the category list and the first 3 stores; the best sellers section is hidden (no true list yet) and there are no banners | CAT-API-5 #50; banners CMS-API-1 #162 |
| A "stores near you are paused" flag | Home: closed state | Never shown from the API; the mock can show it | API gap |
| Filtering home and lists by the customer's location | Home: empty state ("no stores in your area") | Shown only when the catalog has no stores | CAT-API-5 #50 |
| Sorting product lists (best selling, price up, price down) | Category page: sort chips | Chips hidden with the API; the mock sorts | CAT-API-5 #50 |
| Store rating and rating count | Home store cards, store page | Hidden | API gap |
| Store opening hours and open/closed now | Store page: open/closed badge, closed notice, info sheet; products shown unavailable while closed | Hidden; a store is treated as open | API gap |
| Store delivery time and minimum order | Store page badges and minimum order line | Hidden | API gap |
| Store pickup flag | Store info sheet | Hidden | API gap |
| The categories a store sells | Store page: category chips | Taken from the store's products loaded so far | API gap |
| The default size line and the "slaughtered today" tag on product cards | Product cards everywhere | Hidden (card shows vendor, name and the lowest price) | API gap |

### Product detail and customization (STF-MOB-3 #56)

The product page reads one public product (images, sizes, cuts, packagings, exclusions, description). The displayed total is computed on the device by one pure function with the CAT-API-1 formula (size + cut extra + packaging extra, times quantity, VAT included, exclusions free) and returns the same shape and error codes as the server pricing; the server stays authoritative in the cart. With the mock switch on, every seeded product has options (the Al Falah ribeye matches the design option for option, one product per store is out of stock, one carcass has a sold-out size).

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| Cut and packaging incompatibility rules in the public product | Product: disabled packaging with its reason and explanation | No rule from the API: every packaging can be chosen; the server refuses a bad pair when the cart prices the line | API gap (rules exist in the admin lists, CAT-API-1 #48) |
| Product availability and stock per size in the public product | Product: out-of-stock notice, disabled button, total 0.00; disabled size chips | Shown as available from the API (the product card already has an availability flag) | API gap |
| Slaughter time and chilled delivery window | Product: freshness card | Hidden | API gap |
| Store rating in the product | Product: rating next to the store name | Hidden | API gap |
| A default size | Product: the size picked when the page opens | The first size | API gap |
| A gift box packaging | Product: packaging list (the design shows one) | The API knows trays, bags, vacuum and none; only the mock offers a gift box | API gap |
| Server price for a product line (pricing route) | Product: total and price details | Computed on the device with the same formula, in one place to swap. Error names: the incompatible pair uses the API's INCOMPATIBLE_CUTTING_PACKAGING; product unavailable, size unavailable, option not in product and the missing required cut (OPTION_REQUIRED) are the app's names until the pricing route fixes them | CRT-API-1 #61 |
| Whether a cut is required when a product offers cuts | Product: "choose a cut" error on add | The device price function treats a cut as required (OPTION_REQUIRED, the total still shows); the server rule is not decided | CRT-API-1 #61 |
| A name for every cut in the public product | Product: cut list | A cut without a name is left out rather than shown by its id | CAT-API-5 #50 |
| A design for the fulfilment badge (delivery, pickup or both) | Product: the badge the task Output asks for | The value is read from the product and kept, nothing is drawn until the badge is designed | Design gap |
| "Notify me when back in stock" (stock alerts) | Product: out-of-stock notice | The notice says only that the product is unavailable; the design's "you can ask to be notified" sentence is left out until the feature exists | API gap |

### Cart (CRT-MOB-1 #64)

The cart follows the CRT-API-1 / CRT-API-3 shapes of sprint-3.md (lines with the unit price when added, totals subtotal, discount, delivery fee, total, VAT included, minimum order, minimum-order remaining, can-checkout and issues). Every line and total is priced with the app's one price function. A guest's cart is kept on the device and merged into the account cart after sign-in (merge route with the guest lines; same store or an empty account cart sums the same choices, another store is replaced and the user is told, lines that cannot be bought are skipped and counted). With the mock switch on, an in-memory account cart applies the server rules, re-prices against the mock catalog on every read, and uses a minimum order of 100.00 and a delivery fee of 15.00. Mock coupons: JAZLA10 (10%, valid), EID25 (expired), BIG50 (minimum order 300.00), FALAH15 (Al Falah only), WELCOME5 (limit reached); any other code is not found.

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| The cart routes (read, add with replace, change, remove, clear, merge) | Cart; product «أضف إلى السلة»; header badge | Real builds keep everyone's cart on the device, priced from the public product; the mock switch uses the in-memory account cart | CRT-API-1 #61 |
| The current store's name in the store-mismatch refusal (409) | «استبدال السلة؟» dialog | The API message is shown when it comes; otherwise the app names the store of the cart's products | CRT-API-1 #61 |
| A name for the unavailable-line issue code, and the line fields of the cart answer (product name, image, size weight, cut name) | Cart lines and banners | The app's names (an unavailable line is flagged as item unavailable); line details come from the product | CRT-API-1 #61 |
| An idempotent merge (an idempotency key or a client merge id), so a merge repeated after the app died between the merge answer and clearing the device cart does not add the quantities twice | Sign-in: guest cart merge | The device cart is cleared only after a successful merge, so a repeat is possible today. A failed merge leaves the cart in its error state (with retry) and add to cart fails until the retry succeeds | CRT-API-1 #61 |
| How a price-changed issue is cleared | Cart: price banner «موافق» | The app changes the line with its same quantity and the mock then takes today's price | CRT-API-1 #61 |
| Coupon routes and the five coupon error codes | Cart: coupon field | Mock only; the field is hidden for the device cart (guests and real builds) | CRT-API-3 #62 |
| How the cart answer reports a coupon it dropped (it stopped applying, for example the subtotal fell under its minimum) | Cart: coupon field and its banner | The app notices the code is gone without the «إزالة» button, empties the field and shows «لم يعد الرمز … ينطبق على سلتك»; the mock drops such a coupon on the next read | CRT-API-3 #62 |
| Minimum order and delivery fee (public client settings) | Cart: minimum-order line and bar, delivery fee, checkout | Hidden in real builds and checkout is not offered there («الدفع من التطبيق قادم قريبًا»); the mock uses 100.00 and 15.00 | SCH-API-1 #68 |
| Fulfilment on the cart | Cart: the delivery fee row | Not shown until fulfilment is delivery (chosen at checkout) | SCH-API-2 #69, SCH-MOB-1 #71 |

### Checkout step 1: method, address and day (SCH-MOB-1 #71)

The screen follows the SCH-API-1 / SCH-API-2 shapes of sprint-3.md: the public client settings (only the pause is read here: is paused, Arabic and English message), the days for a method (date, available, reason one of past cutoff, closed, full, outside horizon, vendor closed, and the window), the fulfilment save (method, address id for delivery, date) with its four error codes (fulfilment not supported, address not covered, day full, ordering paused), and the pickup point in the cart answer (store name, address, map point, opening and closing time, instructions). Dates and times are shown as the server sends them (Riyadh) and never converted with the device time zone. The app does not compute days: with the mock switch on, an in-memory scheduler applies the SCH-API-1 defaults in Riyadh time with an injectable clock (ready meat 12:00 same day, carcass 20:00 one day ahead, cooked 18:00 one day ahead, occasion three days ahead; a mixed cart takes the strictest), a 14-day horizon (the day after it is sent as outside horizon), a closed day for both methods three days ahead, a closed delivery-only day five days ahead, a full day two days ahead, pickup closed on Fridays, a 16:00 to 22:00 window, and delivery-only or pickup-only items refused for the other method. **QA pause switch:** run with the define MOCK_PAUSED set to true.

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| The public client settings route (pause and its message) | Checkout: paused banner | Mock only; real builds treat the pause as unknown (no banner) and rely on the server refusing a paused save | SCH-API-1 #68 |
| The days route for a method | Checkout: day strip, calendar, window | Mock only; real builds show the days error state with retry, never made-up days (the cart does not offer checkout there anyway, without the ops settings) | SCH-API-2 #69 |
| Days per address: the days route takes only the method, but zone capacity and zone closed days would depend on the address | Checkout: delivery days | The app asks again whenever the address changes; the answer is the same until the route reads an address id | SCH-API-2 #69 |
| The fulfilment save route and its four error codes | Checkout: «متابعة إلى الدفع» | Mock only (validates method support, coverage, pickup offered, the day); the codes map to Arabic and English messages. An unavailable day other than full has no code; the mock answers validation failed | SCH-API-2 #69 |
| The fulfilment and pickup point in the cart answer (and the shape of the pickup hours) | Checkout: pickup card; cart delivery fee | Mock pickup points for the three stores that offer pickup; hours as opening and closing Riyadh times | SCH-API-2 #69 |
| A text for vendor closed and outside horizon days, and the closed day reason text of the closed days setting | Checkout: reason card and key | The app's own texts for the two reasons Figma does not draw; the closed day reason text is not in the day answer, so the card says «مغلق: عطلة المتجر» | SCH-API-2 #69 |
| A URL launcher dependency (and the store phone in the pickup point) | Checkout pickup card: «اتصال بالمتجر» and directions | Left out: the app has no URL launcher, so neither a call nor opening the maps app is possible | SCH-MOB-1 #71 |

### Search and filters (STF-MOB-4 #57)

Search reads the public product list with its words, category, store and price range, cursor-paged. Recent searches are kept on the device (8 at most, cleared on sign-out). With the mock switch on, the seeded catalog is searched on the device the way the server searches: the folded query as one phrase inside the folded Arabic and English product names (no tashkeel or tatweel; أ/إ/آ as ا; ى as ي; ة as ه; English in any case), so «نعيمى» finds «نعيمي» and "naimi" finds the English name. Like the server, store names are not searched, words must be in order, and the words are trimmed and searched only from 2 to 100 characters (shorter text shows the start screen). Recent searches drop repeats that fold to the same words.

| Gap | Screen waiting on it | The app today | Issue |
|---|---|---|---|
| A result count (and facets per category and store) | Search results: "24 results for …"; filters sheet: "Show 24 results" | No count text; the sheet button reads "Show results" | CAT-API-5 #50 |
| Popular searches | Search start: "Most searched" | Section hidden | API gap (CAT-API-5 #50) |
| Sorting search results | Filters sheet: sort chips (the design has no sort control; added as a chip group in the sheet) | Group hidden; the mock sorts | CAT-API-5 #50 |
| An "available now only" filter | Filters sheet: switch and its chip | Switch hidden; the mock filters | API gap |
| A public list of meat types | Filters sheet: meat type (not in the design) | Not shown; the product list already accepts a meat type, so it can be added once names can be listed | API gap |
| Store names for any store id (or the whole store list in one call) | Search: store chips in the filters sheet and the active store chip | Only the first page of stores is offered; a chosen store outside it shows as a generic "Store" chip | API gap |
| Store names in search (and words in any order) | Search results | Not searched, as on the server; the mock matches the server | CAT-API-5 #50 |

When one of these lands, its endpoints appear in `openapi.json`, and this file and the module guides are updated in the same pull request.
