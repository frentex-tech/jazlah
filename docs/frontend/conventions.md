# Conventions: what every request and response looks like

These rules hold for every endpoint. The details of each endpoint are in `openapi.json` (the Swagger page at `/docs` shows the same thing).

## Requests

- **JSON only.** Send a body as `Content-Type: application/json`. Any other content type gets `UNSUPPORTED_MEDIA_TYPE` (415), a body over 100 KB gets `PAYLOAD_TOO_LARGE` (413), and malformed JSON gets `BAD_REQUEST` (400). A request with no body passes. Files never go through the API: they go straight to storage (see [uploads.md](uploads.md)).
- **Validation.** A body, query or path parameter that breaks the documented rules gets `VALIDATION_FAILED` (400), with `details` listing each invalid field (see [errors.md](errors.md)). **A field the schema does not list is refused too** (constraint `whitelistValidation`). Send exactly the documented fields; a generated client does that for you.
- **Ids** are UUIDs (`7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b`). In a path, a value that is not a UUID gets `VALIDATION_FAILED` on `id`, not 404.
- **Text** is trimmed before it is checked. A field that must not be blank is refused when it holds only spaces.
- **Phone numbers** can be sent in any usual Saudi form: `0512345678`, `512345678`, `966512345678` or `+966512345678`, with Latin or Arabic digits. The API answers with the international form (`+966512345678`). Most responses mask it (`+966*******78`). Only the customer's own `GET /v1/customer/me` and admin screens (an order's `customer.phone`) show it in full.
- **PATCH** changes only the fields you send. Leave a field out to keep its value. Where a field may be cleared, its description in `openapi.json` says "null clears it". Where it does not say so, null is `VALIDATION_FAILED`.
- **Language.** Send `Accept-Language: ar` or `Accept-Language: en`. It picks the language of error messages and of the SMS with the sign-in code. English is used only when the header ranks English above Arabic; otherwise the answer is Arabic.

## Responses

- **A success** returns the resource itself, as the operation's response schema in `openapi.json` describes it. Nothing wraps it: there is no `{ data: ... }`. A `204` has no body.
- **An error** always has the same shape, `{ code, message, details?, requestId }`. See [errors.md](errors.md). Branch on `code`, never on `message`.
- **null vs absent.** A field the schema marks `nullable` is always present, and is `null` when there is no value (its description says when). An optional field may be absent.
- **Enums are lowercase strings** (`pending_review`, `delivery`, `vendor.logo`). Treat an unknown value as "other". Do not crash: a later API version may add values.

## Bilingual fields `{ ar, en }`

Names and descriptions entered by admins and vendors are stored in both languages.
- **In a request:** a name is `{ "ar": "...", "en": "..." }`, both required, each 2 to 100 characters. A description is `{ "ar": "...", "en": "..." }`; each language is optional (up to 1000 characters), and in an update, null or a blank text clears that language.
- **In a response:** a name is `{ ar, en }`, both strings. A description is `{ ar, en }`, where each may be `null`.
- **Display:** show the user's language. If a description is `null` in that language, fall back to the other language or hide it. Do not translate on the client.

## Money: integer halalas

Every amount is an **integer number of halalas** (1 SAR = 100 halalas), and **every price includes 15% VAT**. `12500` means 125.00 SAR. Fields carrying money say "halalas" in their description.
- **Never use floating point for arithmetic.** Add and multiply halalas as integers. The server computes every total that matters, so the app only displays amounts.
- **Display:** divide by 100 only when formatting.
  - Dart: `NumberFormat.currency(locale: 'ar_SA', symbol: 'ر.س', decimalDigits: 2).format(halalas / 100)`.
  - TypeScript: `new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(halalas / 100)`. Add `numberingSystem: 'latn'` if the design shows Latin digits.
  - Whether to show `.00` on whole riyals is a design decision; the API always sends the exact halalas.
- **When sending amounts** (a vendor setting prices), convert what the user typed to halalas without floating-point error. Parse the riyals and the halalas parts separately; never `Math.round(value * 100)` on a parsed float.

## Time: UTC on the wire, Riyadh on screen

- Every timestamp is UTC in ISO 8601 with milliseconds: `2026-11-15T10:00:00.000Z`. Send timestamps the same way.
- **Show them in Riyadh time** (`Asia/Riyadh`, UTC+3 all year, no daylight saving), whatever the device's time zone. A customer travelling abroad still sees store times in Riyadh time.
  - TypeScript: `new Intl.DateTimeFormat('ar-SA', { timeZone: 'Asia/Riyadh', dateStyle: 'medium', timeStyle: 'short' })`.
  - Dart: `DateTime.parse(value).toUtc().add(const Duration(hours: 3))`, then format it as a plain time (or use the `timezone` package with `Asia/Riyadh`).
- Business rules about days and cut-off times (delivery days, Eid) are decided by the server. The app shows what the API says and never computes them from the device clock.

## Lists: keyset pagination

Every list is paged the same way, newest first, **without a total count**:
- **Query:**
  - `limit`: 1 to 50, default 20;
  - `cursor`: the `nextCursor` of the previous page; omit it for the first page.
- **Response:** `{ "items": [...], "nextCursor": "..." }`. `nextCursor` is `null` on the last page.
- **The cursor is opaque.** Never build, parse or change it; a cursor the API did not write is `VALIDATION_FAILED`. Do not store it for later: start from the first page when the screen opens.
- **Infinite scroll:** request the next page with `cursor=<nextCursor>` until `nextCursor` is `null`. Items added while the user scrolls do not shift the pages, because the cursor is a position, not an offset.
- **No page numbers or "page 3 of 10".** The API has no count. Show "load more" or infinite scroll.
- **Filters** (for example `status`) are extra query parameters, the same on every page. Changing a filter means starting again from the first page.

**Deliberately not paged.** These return every item at once, in a fixed order:

| Endpoint | Returns |
|---|---|
| `GET /v1/public/categories` | every active category, in the order admins set |
| `GET /v1/customer/addresses` | the customer's addresses, at most ten, the default first |

## `x-request-id`

Every response carries an `x-request-id` header, and every error body has the same value as `requestId`.
- You may send your own `x-request-id` (up to 128 characters of `A-Z a-z 0-9 . _ : -`), for example to follow one user action across the app and the API logs. The API keeps it if it is safe and makes a new one otherwise.
- When a user reports a problem, show or log the `requestId` of the failed response. With it, the backend team can find the request in the logs.

## Rate limits and `Retry-After`

The API counts requests per client address:

| Limit | Default |
|---|---|
| All endpoints, together | 300 requests per minute |
| Every request, before routing (unknown paths included) | 600 per minute |

The sign-in endpoints have stricter limits:
- per address: 30 code requests and 30 verifications per 10 minutes;
- per phone number: 3 code requests per 10 minutes and 10 per day;
- before another code may be requested for the same phone: the wait in `resendAfterSeconds`.

Over a limit, the answer is **429 `RATE_LIMITED`** with a **`Retry-After`** header in seconds. Then:
- do not retry before `Retry-After` has passed, and never retry in a loop;
- on the sign-in screen, show a countdown from `Retry-After` (or from `resendAfterSeconds` after a code request) and enable "resend" when it ends;
- elsewhere, show the error message and let the user try again.

These numbers are server settings and may change per environment. Read `Retry-After` and `resendAfterSeconds`; never hard-code a wait.

## Images and files

Public images (product photos, vendor logos) come as full URLs in the response, ready to show. Cache them by URL.

Private files (vendor application documents) are not included as URLs. The admin screens get a short-lived link from the API when one is needed (see [vendors.md](vendors.md)).

Uploading is described in [uploads.md](uploads.md).
