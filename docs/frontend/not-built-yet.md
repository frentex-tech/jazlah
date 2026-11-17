# Not built yet: what the designs show that the API does not have

The designs cover the whole product, but the API is built in steps. **If a screen needs something listed here, there is no endpoint for it yet.** Build the screen against static data or a feature flag, keep its data layer behind an interface, and wait for the endpoint to appear in `openapi.json`. Never call an endpoint that `openapi.json` does not have, and never guess its shape.

## Built today

Everything in `openapi.json`, which is:
- **Sign-in and sessions:** all four audiences.
- **Customers:** the profile, marketing consent, addresses and account deletion.
- **Vendors:**
  - applications and their review;
  - the vendor profile;
  - suspension and commission;
  - the public vendor list.
- **Catalog:**
  - reference lists and incompatibilities;
  - vendor and admin products, review and change requests;
  - prices, availability and fulfilment;
  - public browsing.
- **Uploads:** for every audience that has a purpose.

## Coming next (decided, built right after this handoff)

These API changes are decided and will be built in one pull request after the frontend handoff and the staging server. Plan the screens that depend on them; the fields and endpoints will appear in `openapi.json` when they land. Until then, nothing below exists.

### Vendors
1. **Contact phone and email on the vendor.** The vendor edits them in its profile, and an admin can edit them too. They are for the platform's order operations and are not public, unless decided later.
2. **VAT number**, optional, 15 digits in the Saudi format, on the application and on the vendor.
3. **City** on the application and on the vendor: text, required for new applications.
4. **Store cover photo:** a new public upload purpose, editable by the vendor and by an admin, and returned on the public vendor page.
5. **Search in the admin vendor list:** by store name or commercial registration number, with a filter by city. The admin applications list gets the same search.
6. **New document kinds:**
   - The new kinds are the municipality licence and the national ID.
   - They will be accepted as optional.
   - Which kinds are required waits for the owner's decision. Until then the required set stays as today (see [vendors.md](vendors.md)).

### Catalog
7. **Text search on the public product list:**
   - a `q` parameter matching the product name in Arabic and English;
   - combined with the existing filters and pagination;
   - Arabic search will ignore diacritics and treat the alef, yaa and taa marbuta forms as equal.
8. **Packaging extra price:**
   - each packaging option on a product may carry an optional extra price in halalas, like cutting styles;
   - on a published product, a change applies at once and is recorded in the audit log.
9. **Category image:** a new public upload purpose; categories will return an image URL.

## Later (recorded, not scheduled in that batch)

- Ratings and reviews, loyalty points, stories and banners, Eid al-Adha campaigns.
- Store opening hours and an open or closed status, a minimum order, delivery time estimates.
- Per product: preparation time and availability by weekday.
- Itemised rejection feedback (per field), and re-uploading a single document of an application.
- Vendor invitations, exports, and product counts in admin lists.

## Known gaps (found during the handoff, not yet scheduled)

**The vendor product form's pickers.** Vendors can read the active categories (`GET /v1/public/categories`), but not:
- the meat types, cutting styles and "without" items, which only `GET /v1/admin/lists/{list}` lists, for admins;
- the incompatible cutting and packaging pairs, which only `GET /v1/admin/cutting-packaging-incompatibilities` lists.

So the vendor dashboard cannot fill those pickers from the API yet. The backend team has to decide on an endpoint for vendors. Until then, build the pickers behind an interface and do not call the admin endpoints with a vendor token.

## Not built: the order side of the product

None of these has an endpoint yet:

| Area | What the screens may show | Status |
|---|---|---|
| **Cart** | Adding a product with a size, cutting, packaging and exclusions; the cart badge; preparation notes on a cart line | not built |
| **Checkout** | Address choice, delivery slot, totals with VAT, payment method; the complete-profile check and the address lock at checkout | not built |
| **Orders** | Order list and detail, statuses, cancellation, re-order; the vendor's and kitchen's order queues | not built |
| **Payments** | Card payment (Geidea), Apple Pay, cash on delivery, BNPL (instalments) | not built |
| **Delivery and scheduling** | Delivery zones (the check on addresses comes with zones), slots and capacity, Eid days, driver tracking | not built |
| **Refunds and wallet** | Refunds, partial refunds, weight adjustments, wallet balance | not built |
| **Finance** | Vendor statements, payouts, commission reports | not built |
| **Invoices** | VAT invoices (ZATCA e-invoicing) | not built |
| **Notifications** | Push notifications, notification list, notification settings; SMS other than the sign-in code | not built |
| **Kitchen dashboard** | Everything except sign-in, `GET /v1/kitchen/me` and sign-out | not built |
| **Staff management** | Granting or removing vendor staff, kitchen or admin access from a dashboard; disabling a user | not built (the first admin is created by a backend command) |
| **Sessions** | A list of the user's devices and sessions | not built (`logout-all` exists) |
| **Realtime** | Live updates (order status, new order alerts) | not built |
| **Customer website extras** | Anything beyond what the customer app uses | not built |

When one of these lands, its endpoints appear in `openapi.json`, and this file and the module guides are updated in the same pull request.
