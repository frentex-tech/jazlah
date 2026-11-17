# Vendors: applying, the store profile, and the admin's vendor screens

A **vendor** is a store (a butcher, a slaughterhouse) that sells on JAZLA. The platform itself also sells, as the **platform vendor** (`isPlatform: true`), whose products admins manage.

A customer becomes a vendor like this:
1. They apply from the customer app.
2. An admin approves the application, with a commission.
3. The same phone number can then sign in to the vendor dashboard (audience `vendor`).

## Customer app: "Sell on JAZLA"

**Show the right screen first:** `GET /v1/customer/vendor-applications/latest`.

| Answer | Screen |
|---|---|
| `NOT_FOUND` | never applied: show the form |
| `status: "pending"` | "under review" |
| `status: "approved"` | "approved: sign in to the vendor dashboard" |
| `status: "rejected"` | show `rejectionReason` and offer to apply again |

**The form:**
1. **Upload each document** with purpose `vendor.document` (PDF, JPEG or PNG, up to 10 MiB), and confirm each one (see [uploads.md](uploads.md)):
   - `POST /v1/customer/media/uploads`;
   - upload the file to storage;
   - `POST /v1/customer/media/{id}/confirm`.
2. **Submit:** `POST /v1/customer/vendor-applications` with:

| Field | Rules |
|---|---|
| `name` | `{ ar, en }`, both required, 2 to 100 characters each: the store name customers will see |
| `description` | optional `{ ar?, en? }`, up to 1000 characters each |
| `commercialRegistrationNumber` | 10 digits, Latin or Arabic: `1010123456` |
| `iban` | a Saudi IBAN, `SA` + 22 characters, spaces allowed. Never returned in full afterwards, only masked |
| `accountHolderName` | the name on the bank account, 2 to 100 characters |
| `location` | `{ latitude, longitude }`: the shop or facility |
| `documents` | 3 to 10 items `{ kind, mediaId }`, at least one of each kind: `commercial_registration`, `health_certificate`, `facility_photo`; each file once |

3. **Result:** 201 with the application, `status: "pending"`.

**Errors:**

| Code | Meaning |
|---|---|
| `VALIDATION_FAILED` | Names the field. For `documents`, the constraints are `requiresEachDocumentKind`, `uniqueFiles` and `arrayMaxSize`. For `iban`, the constraint is `isSaudiIban`. |
| `MEDIA_NOT_FOUND`, `MEDIA_NOT_READY` | `details.mediaId` names the file: it was not uploaded by this customer with that purpose, or not confirmed. |
| `VENDOR_APPLICATION_ALREADY_PENDING` | One application is already waiting. Show it instead. |
| `VENDOR_ACCESS_ALREADY_HELD` | This user already works for a vendor. |

Coming next: optional VAT number, city, and new document kinds (see [not-built-yet.md](not-built-yet.md#coming-next-decided-built-right-after-this-handoff)).

## Vendor dashboard: store profile

Signing in is described in [auth.md](auth.md); the dashboard uses audience `vendor`.
- **Who is signed in:** `GET /v1/vendor/me`.
- **When the store is suspended:** every vendor endpoint, and sign-in and refresh too, answers `VENDOR_SUSPENDED` (403). Show a "store suspended" screen and sign the user out.

**Read the profile:** `GET /v1/vendor/profile` returns:
- the store name and description;
- `logoUrl`;
- `commissionBasisPoints` (1250 is 12.5%);
- the commercial registration;
- `ibanMasked`;
- `accountHolderName`;
- `location`.

The name, registration, bank details and location come from the approved application. **Only an admin can change them.**

**Change the logo or the description:** `PATCH /v1/vendor/profile`. It applies at once, with no review.

| Field | How it works |
|---|---|
| `logoMediaId` | Upload with purpose `vendor.logo` (JPEG, PNG or WebP, up to 2 MiB) through `POST /v1/vendor/media/uploads`, confirm it, then send its id. `null` removes the logo. |
| `description` | `{ ar?, en? }`. A language left out stays as it is; `null` or blank clears it. |

A field left out stays as it is. An empty body changes nothing.

The vendor's products are in [catalog.md](catalog.md).

## Admin dashboard: applications

**Review queue:** `GET /v1/admin/vendor-applications?status=pending`.
- Paged (see [conventions.md](conventions.md#lists-keyset-pagination)).
- Without `status` it lists every application, newest first.
- The IBAN is masked.

**Review screen:** `GET /v1/admin/vendor-applications/{id}` returns the application, who reviewed it, and for each document a **short-lived link** (`url`, `expiresAt`).
- Open documents from these links.
- Never store the links: read the application again for fresh ones.
- `NOT_FOUND` also means the applicant deleted their account; only pending and rejected applications are removed.

**Approve:** `POST /v1/admin/vendor-applications/{id}/approve` with `{ "commissionBasisPoints": 1250 }`, a whole number from 0 to 10000. In one step it:
- creates the vendor, active and listed publicly at once, without a logo;
- records the first commission;
- gives the applicant vendor access.

The answer is the new vendor.

**Reject:** `POST /v1/admin/vendor-applications/{id}/reject` with `{ "reason": "..." }`, 1 to 500 characters. The applicant sees the reason in the customer app, so write it for them. A rejection is final for that application, and the applicant may apply again.

**Errors on both:**

| Code | Meaning |
|---|---|
| `VENDOR_APPLICATION_NOT_PENDING` | Another admin already reviewed it. Reload. |
| `VENDOR_ACCESS_ALREADY_HELD` | Approve only: the applicant came to work for another vendor after applying. Nothing changed. |

## Admin dashboard: vendors

**List:** `GET /v1/admin/vendors`, optionally with `?status=active` or `?status=suspended`.
- It includes the platform vendor (`isPlatform: true`).
- Paged.

**One vendor:** `GET /v1/admin/vendors/{id}`. The answer includes:
- `status`;
- `suspendedAt` and `suspensionReason`;
- `commissionBasisPoints`;
- `applicationId`.

**Suspend:** `POST /v1/admin/vendors/{id}/suspend` with `{ "reason": "..." }`. The reason is shown to admins only.
- From that moment, its users are refused everywhere (`VENDOR_SUSPENDED`).
- It disappears from the public vendor list and its store page.
- It answers `CONFLICT` with `details.reason: "VENDOR_ALREADY_SUSPENDED"` if it is already suspended.

**Reinstate:** `POST /v1/admin/vendors/{id}/reinstate`, with no body. It answers `CONFLICT` with `details.reason: "VENDOR_NOT_SUSPENDED"` if the vendor is active.

**Logo and description:** `PATCH /v1/admin/vendors/{id}/profile` works like the vendor's own `PATCH`.
- Upload the logo as the admin, through `POST /v1/admin/media/uploads` and `POST /v1/admin/media/{id}/confirm`.
- This is how the platform vendor's profile is set.

**Commission:**
- **Set it:** `PUT /v1/admin/vendors/{id}/commission` with `{ "commissionBasisPoints": 1100 }`.
  - It applies to **future** orders only.
  - Setting the current value changes nothing.
  - `CONFLICT`: another admin changed it at the same moment. Reload and decide again.
- **History:** `GET /v1/admin/vendors/{id}/commission-history`, newest first, paged. Each entry has the value, the previous value and the admin who set it. Entries never change.

Every admin action here is recorded in the audit log.

## Customer app and website: stores

- **Stores list:** `GET /v1/public/vendors`. It lists active vendors only (name, description, `logoUrl`), paged. No token is needed.
- **Store page:** `GET /v1/public/vendors/{id}`. `NOT_FOUND` for an unknown or suspended vendor alike: show "store unavailable".
- **The store's products:** `GET /v1/public/products?vendorId=<id>` (see [catalog.md](catalog.md)).

## Statuses

| Thing | Values | Moves |
|---|---|---|
| Application `status` | `pending`, `approved`, `rejected` | `pending` moves to `approved` or `rejected`, once, never back |
| Vendor `status` | `active`, `suspended` | `active` and `suspended` both ways, by an admin |
