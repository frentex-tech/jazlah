# Errors: the body, every code, and what the app does

## The error body

Every error, from every endpoint, has this shape (`ErrorResponseDto` in `openapi.json`):

```json
{
  "code": "VALIDATION_FAILED",
  "message": "فيه بيانات ناقصة أو غير صحيحة، راجعها وجرّب مرة ثانية",
  "details": [{ "field": "location", "constraints": ["isDefined"] }],
  "requestId": "3f2b8c1e-7d4a-4b6f-9a2e-5c8d1f0e6b7a"
}
```

| Field | Meaning |
|---|---|
| `code` | Stable, UPPER_SNAKE_CASE. **Branch on it.** A code is never renamed or reused. |
| `message` | Text for the user, already translated: Arabic, or English when `Accept-Language` ranks English above Arabic. You may show it as is. **Never branch on it**: the wording changes. |
| `details` | Optional. For `VALIDATION_FAILED`, a list of `{ field, constraints }`. For some codes, an object described in the table below. Otherwise absent. |
| `requestId` | The same as the `x-request-id` response header. Log it, and show it in "report a problem". |

### `VALIDATION_FAILED` details

`details` lists each invalid field:
- `field` is the path in the request: `phone`, `location.latitude`, `sizes.0.priceHalalas`, or `id` for a path parameter.
- `constraints` names the rules it broke, such as `isDefined`, `isString`, `charLength`, `isUUID`, `whitelistValidation` (a field the schema does not have) or `isIn`.

Show the message next to the field when the screen has one, and the general `message` otherwise. A `VALIDATION_FAILED` the user could not have caused, such as a bad id, is a bug in the app: log it with the `requestId`.

## What the app does, by kind

| Kind | Do |
|---|---|
| **Show** | Show `message`, keep the user's input, and let them correct and resend. |
| **Retry** | Show `message` with a "try again" action. Retry automatically at most once, after a short pause, and only for idempotent reads (GET) or when the code says nothing was saved. |
| **Wait** | Read `Retry-After` (seconds), disable the action until then, and never loop. |
| **Refresh token** | Call `POST /v1/public/auth/refresh` once, then repeat the request with the new access token. See [auth.md](auth.md). |
| **Sign in again** | Clear the stored tokens and go to the sign-in screen. |
| **Reload** | The data on screen is out of date. Fetch it again and show the new state. |
| **Bug** | The app sent something it should not have. Show the generic message, and log `code`, `requestId` and the endpoint. |

## Every code

Status is the HTTP status the code always comes with. The English message is the text the API sends for `Accept-Language: en`; Arabic is the default.

### Any endpoint

| Code | Status | English message | The app should |
|---|---|---|---|
| `VALIDATION_FAILED` | 400 | The request data is invalid. | **Show**, at the fields in `details`. |
| `BAD_REQUEST` | 400 | The request could not be processed. | **Bug**. It means malformed JSON, or a value the database refused. |
| `NOT_FOUND` | 404 | The requested resource was not found. | **Reload**: the item was deleted, or never belonged to this user. Go back to the list. |
| `METHOD_NOT_ALLOWED` | 405 | This request method is not allowed for this route. | **Bug**. |
| `CONFLICT` | 409 | The request conflicts with the current state of the resource. | **Reload**, then **Show**: something it depends on changed (for example, a list item was just deleted). |
| `PAYLOAD_TOO_LARGE` | 413 | The request is too large. | **Bug**: bodies are small JSON, and files go to storage. |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | The request content type is not supported. | **Bug**: send `Content-Type: application/json`. |
| `RATE_LIMITED` | 429 | Too many requests. Please try again later. | **Wait** for `Retry-After`. |
| `TRANSACTION_CONFLICT` | 409 | The request clashed with another one made at the same time and nothing was saved. Please try again. | **Retry**: nothing was saved, so sending the same request again is safe. |
| `SERVICE_UNAVAILABLE` | 503 | The service is temporarily unavailable. Please try again shortly. | **Retry** after a pause, with a "try again" button. Nothing was done if the request failed before its effect. |
| `INTERNAL_ERROR` | 500 | An unexpected error occurred. Please try again later. | Show the message with a "try again" action. Log the `requestId`. |

### Signing in and the session (auth)

| Code | Status | English message | The app should |
|---|---|---|---|
| `UNAUTHORIZED` | 401 | Authentication is required. | **Sign in again**: there was no token, or it is not valid. Do not refresh. |
| `ACCESS_TOKEN_EXPIRED` | 401 | The access token has expired. Please refresh it. | **Refresh token**, then repeat the request. This is the only 401 that refreshes. |
| `FORBIDDEN` | 403 | You do not have permission to perform this action. | The token is for another audience, or the user's access was removed. **Sign in again** for this app. |
| `REFRESH_TOKEN_INVALID` | 401 | Your session has ended. Please sign in again. | **Sign in again**: the session ended (signed out, expired, deleted account, or the refresh token was used twice). |
| `OTP_INVALID` | 422 | The verification code is incorrect. | **Show**, clear the code field and let the user type again. The attempt was counted. |
| `OTP_EXPIRED` | 410 | The verification code is no longer valid. Please request a new one. | **Show**, and offer "send a new code". The code expired, was used, or ran out of attempts. |
| `ACCOUNT_DISABLED` | 403 | This account has been disabled. | **Sign in again** will not help. Show the message with a way to contact support, and clear the tokens. |
| `RECENT_SIGN_IN_REQUIRED` | 403 | For your security, sign in again, then delete your account. | Account deletion only: **Sign in again** (code by SMS), then repeat the deletion. Not a refresh. |
| `ACCOUNT_HAS_STAFF_ACCESS` | 409 | Your account has vendor, kitchen or admin access. Contact us to remove it before deleting your account. | Account deletion only: **Show**, with a way to contact support. |

### Customers

| Code | Status | English message | The app should |
|---|---|---|---|
| `ADDRESS_LIMIT_REACHED` | 409 | You have reached the maximum number of addresses. Delete one to add another. | **Show**. `details.limit` is the maximum (10). Point the user to the address list. |

### Vendors

| Code | Status | English message | The app should |
|---|---|---|---|
| `VENDOR_APPLICATION_ALREADY_PENDING` | 409 | You already have a vendor application under review. | **Show**, and open the application status (`GET /v1/customer/vendor-applications/latest`). |
| `VENDOR_ACCESS_ALREADY_HELD` | 409 | This account already works for a vendor. | **Show**. The customer app hides "become a vendor" after this. For an admin approving an application, the applicant got vendor access elsewhere in the meantime. |
| `VENDOR_APPLICATION_NOT_PENDING` | 409 | This vendor application has already been reviewed. | Admin: **Reload** the application, because another admin reviewed it. |
| `VENDOR_SUSPENDED` | 403 | This vendor account is suspended. | Vendor dashboard: show a "suspended" screen with a way to contact the platform. Every vendor route, sign-in and refresh is refused until an admin reinstates the vendor. Clear the tokens. |

### Catalog

| Code | Status | English message | The app should |
|---|---|---|---|
| `PRODUCT_NOT_EDITABLE` | 409 | This product cannot be changed in its current state. | **Reload** the product. `details.status` is its current status: for example, it is under review, or an admin already reviewed it. |
| `PRODUCT_NOT_SUBMITTABLE` | 422 | Add at least one image and one size, and packaging that suits each cutting style. | **Show** what is missing. `details.reasons` lists `NO_SIZE`, `NO_IMAGE` and `INCOMPATIBLE_CUTTING_PACKAGING`; the last comes with `pairs`, the cutting and packaging pairs that cannot be combined. |
| `PRODUCT_CHANGE_REQUEST_SUPERSEDED` | 409 | The vendor has edited this product again since this request. Reload and review the newer request. | Admin: **Reload** the change requests and review the newer one. |

### Uploads (media)

| Code | Status | English message | The app should |
|---|---|---|---|
| `MEDIA_CONTENT_TYPE_NOT_ALLOWED` | 415 | This file type is not allowed here. | **Show**. Check the allowed types before asking (see [uploads.md](uploads.md)). |
| `MEDIA_NOT_FOUND` | 404 | The file was not found. | Start the upload again from the request step. The id is unknown or was cleaned up. |
| `MEDIA_UPLOAD_EXPIRED` | 410 | The upload was not confirmed in time. Please upload the file again. | Start the upload again from the request step. |
| `MEDIA_UPLOAD_REJECTED` | 422 | The uploaded file was rejected because it does not meet the requirements. Please upload another file. | **Show**, and let the user pick another file. `details.reason` is one of `OBJECT_MISSING` (nothing was uploaded), `EMPTY_FILE`, `TOO_LARGE`, `TYPE_NOT_ALLOWED` or `CONTENT_TYPE_MISMATCH` (the file is not the declared type). |
| `MEDIA_NOT_READY` | 409 | The file is not ready yet. | A file was used (on a product, in an application) before its upload was confirmed. Confirm it first, then repeat. |

## Which codes an endpoint returns

Each operation in `openapi.json` lists exactly the codes it can return, grouped by HTTP status (`"Error. code: A, B."`). Your generated client exposes them per operation. Handle at least those of the endpoints a screen calls, plus the "any endpoint" ones above.

The list is checked by tests: the end-to-end suites fail when a route returns a code its operation does not list. If you ever receive a code that is not listed for that endpoint, report it to the backend team with the `requestId`.
