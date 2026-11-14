---
paths:
  - "src/**/*.controller.ts"
  - "src/**/dto/**"
  - "src/**/*.dto.ts"
  - "src/main.ts"
  - "src/infra/http/**"
  - "src/infra/api-docs/**"
  - "src/infra/rate-limit/**"
  - "src/common/decorators/**"
  - "openapi.json"
---

# HTTP: API documentation and the security baseline

How every endpoint is documented, and how the HTTP layer protects the API. Paths are relative to `services/api/`. Decisions and reasons: `.claude/DECISIONS.md`, "HTTP, API documentation and security".

## API documentation

The OpenAPI document is a contract: the mobile client is generated from `openapi.json`, and a change to it shows up in review. So no endpoint returns a shape the document does not describe.

1. **Every endpoint documents its success response with a DTO class**: `@ApiOkResponse({ type: XResponseDto })` (or `ApiCreatedResponse` and so on), and the method's return type is that class. Never a plain type, an inline object or an undocumented `Record`.
2. **Every endpoint documents its error responses with `@ApiErrorResponses(...codes)`** (`src/common/decorators/api-error-responses.decorator.ts`), listing each code it can return, for example `@ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ErrorCode.RATE_LIMITED)`. The helper documents each code under its default status, adds INTERNAL_ERROR, and references the one shared `ErrorResponseDto`. Never declare an error schema on an endpoint. A rate-limited endpoint (all except those with `@SkipRateLimit`) lists RATE_LIMITED.
3. **Every request body and query is a DTO class**, with class-validator decorators for the validation pipe and `@ApiProperty` / `@ApiPropertyOptional` for the document, with an `example`.
4. **`@ApiProperty` on every DTO property, with an explicit `type` for arrays, nested DTOs and enums** (`type: [String]`, `type: NestedDto`, `enum: [...]`). There is no Swagger CLI plugin, so a property without the decorator is missing from the document.
5. **A controller has `@ApiTags('<module>')`.** An endpoint that needs authentication has `@ApiBearerAuth(BEARER_AUTH_SCHEME)` (`src/common/decorators/bearer-auth.constants.ts`).
6. **After changing an endpoint or a DTO, run `pnpm openapi:generate` and include `openapi.json` in the change.** `pnpm openapi:check` fails while the file is out of date, and it is part of "done" (`CLAUDE.md`). Read the diff of `openapi.json`: it is what the mobile app will see.
7. **The document is generated without a running app** (Nest preview mode). Nothing in a controller's or DTO's decorators may depend on configuration or on a provider instance.

Served at `/docs` (Swagger page) and `/docs-json`, outside `/v1`; on in development and test, off in production unless `API_DOCS_ENABLED=true`.

## Security baseline

Set up in one place, `configureHttpApp` (`src/infra/http/configure-http-app.ts`), called by `main.ts` and by the e2e tests (`test/support/create-http-app.ts`). Change it there, never in `main.ts` alone, or the tests stop testing what runs.

1. **helmet with its defaults on every response.** Do not relax a directive for the whole app. If one route needs a relaxation (an HTML page that loads an outside script), apply a second helmet with the relaxed policy to that route only, and record why in `.claude/DECISIONS.md`.
2. **CORS** allows exactly the origins in `CORS_ORIGINS`; empty means off. The schema refuses `*` in production. No cookies are allowed across origins (credentials off).
3. **Rate limiting** has two layers, both counted in Redis per client address (`req.ip`):
   - **Before routing**, every request of any kind, unknown paths and malformed bodies included: `RATE_LIMIT_PRE_ROUTING_MAX_REQUESTS` per `RATE_LIMIT_WINDOW_MS` (`PreRoutingRateLimiter`, mounted by `configureHttpApp`). The health checks are not counted.
   - **Per route**, on every endpoint by default: `RATE_LIMIT_MAX_REQUESTS` per `RATE_LIMIT_WINDOW_MS`, one counter per address across all endpoints.
   - An endpoint that is a target for abuse (OTP, login, anything that sends a message or costs money) gets a stricter limit: `@RateLimit({ name, limit, windowMs, blockMs?, failClosed? })` from `src/infra/rate-limit/rate-limit.decorator.ts`, on the counter `name`.
     - The name is required, lowercase words joined by dashes or dots (`otp-request`). Endpoints share a counter only by declaring the same name with the same settings; the same name with other settings stops the application at startup, naming both endpoints. Name a counter for what it protects, not for the controller.
     - `limit`, `windowMs` and `blockMs` are positive whole numbers, and `blockMs` (default `windowMs`) is never shorter than `windowMs`. Anything else stops the application when the file loads.
     - A blocked client's counter is kept, so waiting out a block inside the window buys no requests back.
     - `failClosed: true` for an endpoint where an unlimited request costs money or is a security risk, OTP first among them: while Redis is unavailable its requests get 503 SERVICE_UNAVAILABLE instead of going through (`.claude/DECISIONS.md`, "Sensitive endpoints fail closed"). List SERVICE_UNAVAILABLE in its `@ApiErrorResponses`.
   - `@SkipRateLimit()` only for endpoints that infrastructure calls (health). Never for a business endpoint. A controller with `@SkipRateLimit()` may not have a `@RateLimit` method: startup fails.
   - Over a limit: 429 RATE_LIMITED in the standard error shape, with `Retry-After` in seconds.
   - **R19 (lint):** `@Throttle` and `@SkipThrottle` from `@nestjs/throttler` are used only inside `src/infra/rate-limit/`, imported or through a namespace. *Why: the library decorators bypass our counter names and keys, the startup policy check and `failClosed`.* Endpoints use `@RateLimit` and `@SkipRateLimit` from `src/infra/rate-limit/`.
   - While Redis is unavailable both layers let requests through, except fail-closed endpoints, and log a warning once per outage (`.claude/DECISIONS.md`, "Rate limiting fails open"). While the shared client is not connected, Redis is skipped at once; a connected Redis gets at most 500 ms.
4. **Request bodies are JSON only**, up to `REQUEST_BODY_LIMIT_KB` (default 100): a request without a body passes (`Content-Length: 0`, whatever its type), another type gets 415 UNSUPPORTED_MEDIA_TYPE, a bigger body 413, malformed JSON 400. There is no form parser. A route that needs another body type (a webhook signed over its raw body) enables its own parser explicitly in `configureHttpApp`, for its path only, exempted from `requireJsonBody`, with a line in `.claude/DECISIONS.md`. Files never pass through the API: they are uploaded to object storage with a presigned URL. Do not raise the limit for an upload.
5. **No `x-powered-by`.** Nothing should announce the framework.
6. **The order of the HTTP layer is fixed in `configureHttpApp`**: request logger (request id), helmet, CORS, pre-routing rate limit, JSON-only check and parser, then Nest (guards, the per-route limit, pipes, the handler). Everything refused before Nest is still logged with its request id. Add a middleware there, in its place in that order, never with `app.use` in `main.ts`.

### Guard order

A global authentication guard, when one is added, must run **after** the rate limits, so that failed token attempts are counted. How that holds:

- **The pre-routing limit is Express middleware**, mounted by `configureHttpApp` before Nest's router. Every guard runs inside Nest, after all Express middleware, so no guard can run before it. Every request with a bad token is counted there, per address, whatever the guards do.
- **The per-route limit is `RateLimitGuard`, registered as `APP_GUARD` in `RateLimitModule`.** Nest runs global guards in the order their providers are registered, which follows module import order. Register the authentication guard's `APP_GUARD` in a module imported **after** `RateLimitModule` in `AppModule.imports`, and never register global guards anywhere else.
- **Proven by test:** the task that adds the authentication guard adds an e2e test that sends requests with an invalid token to a `@RateLimit` endpoint and expects 429 once the limit is reached, not 401 forever. Without that test the order is not enforced.

### Behind a proxy

In production the API runs behind a load balancer. Every request then arrives from the load balancer's address, and the client's real address is only in the `X-Forwarded-For` header, which the load balancer appends to.

- `TRUST_PROXY_HOPS` tells Express how many proxies in front of the API to trust (`trust proxy`). It is required when `NODE_ENV` is production, with no default there, so it cannot be forgotten; elsewhere it defaults to 0. With 1, `req.ip` is the address the load balancer saw, the last entry of `X-Forwarded-For`. The rate limiter counts by `req.ip`.
- **Too low (0 behind a load balancer):** every client has the load balancer's address, so all customers share one counter, and one busy client gets everyone else 429s.
- **Too high (more hops than there are proxies):** Express trusts entries the client wrote itself. A client sends a different forged `X-Forwarded-For` on each request, gets a new counter each time, and the limit no longer holds.
- So set it to exactly the number of proxies that append to the header: usually 1 for one load balancer, 2 for a CDN in front of a load balancer. Locally and in tests it is 0. Both cases are covered by `test/rate-limit.e2e-spec.ts`.
- Request logs and anything else that reads the client address use `req.ip` too, so the same setting makes them right.
