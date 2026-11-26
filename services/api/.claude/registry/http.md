# Registry: HTTP, API docs and health

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **ApiErrorResponses** — `src/common/decorators/api-error-responses.decorator.ts` — documents an endpoint's errors; `BEARER_AUTH_SCHEME` `src/common/decorators/bearer-auth.constants.ts`.
- **Request id** — `src/common/request-id/resolve-request-id.ts` — keeps a safe `x-request-id` or makes one; `src/common/request-id/request-id.constants.ts`.
- **Health** — `src/infra/health/` — `GET /v1/health`, `/v1/health/ready`, `ShutdownState`. [whole folder: the health endpoints and their checks]
- **HTTP setup** — `src/infra/http/` — `configureHttpApp`, for `main.ts` and the e2e tests. [whole folder: configureHttpApp and its parts]
- **API docs** — `src/infra/api-docs/` — `buildOpenApiDocument`, `setupApiDocs`. [whole folder: the one OpenAPI document]
- **IdParamDto** — `src/common/dto/id-param.dto.ts` — the `:id` path parameter: a UUID, or VALIDATION_FAILED on `id`.
- **Bilingual DTOs** — `src/common/dto/localized-name.dto.ts` — `{ ar, en }` request and response shapes: a required name (2 to 100 characters each), `src/common/dto/localized-description.dto.ts` (optional, up to 1000), `src/common/dto/localized-text-response.dto.ts`, `src/common/dto/optional-localized-text-response.dto.ts`; text transforms `src/common/dto/trim-text.ts`, `src/common/dto/to-optional-text.ts`, `src/common/dto/to-email.ts` (lowercase, blank is null), `src/common/dto/to-compact-text.ts` (names: format characters out, spaces collapsed).
- **ReasonDto** — `src/common/dto/reason.dto.ts` — a `{ reason }` body (1 to 500 characters), for rejections and suspensions.
- **ADMIN_AUTH_ERRORS** — `src/common/decorators/admin-auth-errors.constants.ts` — the authentication error codes every admin endpoint lists in `@ApiErrorResponses`.
- **VENDOR_AUTH_ERRORS** — `src/common/decorators/vendor-auth-errors.constants.ts` — the authentication error codes every vendor endpoint lists (VENDOR_SUSPENDED included).
- **KITCHEN_AUTH_ERRORS** — `src/common/decorators/kitchen-auth-errors.constants.ts` — the authentication error codes every kitchen endpoint lists.
- **CUSTOMER_AUTH_ERRORS** — `src/common/decorators/customer-auth-errors.constants.ts` — the authentication error codes every customer endpoint lists.
- **CharLength** — `src/common/decorators/char-length.decorator.ts` — a string length in code points, as PostgreSQL's `char_length` counts it (constraint `charLength`): for every length a check constraint also limits.
- **GeoPointDto** — `src/common/dto/geo-point.dto.ts` — a `{ latitude, longitude }` point in degrees, request and response, numbers only (vendors, customers' addresses).
- **TimeWindowDto** — `src/common/dto/time-window.dto.ts` — a Riyadh `HH:mm` to `HH:mm` window, request and response (delivery window, store hours, checkout days).
- **IdempotencyKey** — `src/common/decorators/idempotency-key.decorator.ts` — `@IdempotencyKey()` parameter: the required `Idempotency-Key` header as a lower-case UUID, VALIDATION_FAILED on `Idempotency-Key` otherwise; the use case keeps the key per user with `IdempotencyRunner` and `hashRequestBody` (IDEMPOTENCY_KEY_REUSED for another body).
