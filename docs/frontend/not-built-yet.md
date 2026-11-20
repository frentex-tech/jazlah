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

The code length in the code request answer is asked for in the mobile section below; the dashboard needs it too (a dashboard setting today).

The dashboard's in-process mocks (staff and customer sign-in accounts, an in-memory coverage store, vendor applications, store profile and a mock upload storage) exist only for its smoke tests; they stand in for nothing missing.

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
| A home feed (banners, best sellers, featured, partner stores in one call) | Home | Built from the category list, the first 4 products (not real best sellers) and the first 3 stores; no banners | CAT-API-5 #50; banners CMS-API-1 #162 |
| A "stores near you are paused" flag | Home: closed state | Never shown from the API; the mock can show it | API gap |
| Filtering home and lists by the customer's location | Home: empty state ("no stores in your area") | Shown only when the catalog has no products and no stores | CAT-API-5 #50 |
| Sorting product lists (best selling, price up, price down) | Category page: sort chips | Chips hidden with the API; the mock sorts | CAT-API-5 #50 |
| Store rating and rating count | Home store cards, store page | Hidden | API gap |
| Store opening hours and open/closed now | Store page: open/closed badge, closed notice, info sheet; products shown unavailable while closed | Hidden; a store is treated as open | API gap |
| Store delivery time and minimum order | Store page badges and minimum order line | Hidden | API gap |
| Store pickup flag | Store info sheet | Hidden | API gap |
| The categories a store sells | Store page: category chips | Taken from the store's products loaded so far | API gap |
| The default size line and the "slaughtered today" tag on product cards | Product cards everywhere | Hidden (card shows vendor, name and the lowest price) | API gap |

When one of these lands, its endpoints appear in `openapi.json`, and this file and the module guides are updated in the same pull request.
