# Registry: HTTP, API docs and health

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **ApiErrorResponses** — `src/common/decorators/api-error-responses.decorator.ts` — documents an endpoint's errors; `BEARER_AUTH_SCHEME` `src/common/decorators/bearer-auth.constants.ts`.
- **Request id** — `src/common/request-id/resolve-request-id.ts` — keeps a safe `x-request-id` or makes one; `src/common/request-id/request-id.constants.ts`.
- **Health** — `src/infra/health/` — `GET /v1/health`, `/v1/health/ready`, `ShutdownState`. [whole folder: the health endpoints and their checks]
- **HTTP setup** — `src/infra/http/` — `configureHttpApp`, for `main.ts` and the e2e tests. [whole folder: configureHttpApp and its parts]
- **API docs** — `src/infra/api-docs/` — `buildOpenApiDocument`, `setupApiDocs`. [whole folder: the one OpenAPI document]
- **IdParamDto** — `src/common/dto/id-param.dto.ts` — the `:id` path parameter: a UUID, or VALIDATION_FAILED on `id`.
- **Bilingual DTOs** — `src/common/dto/localized-name.dto.ts` — `{ ar, en }` request and response shapes: a required name (2 to 100 characters each), `src/common/dto/localized-description.dto.ts` (optional, up to 1000), `src/common/dto/localized-text-response.dto.ts`, `src/common/dto/optional-localized-text-response.dto.ts`; text transforms `src/common/dto/trim-text.ts`, `src/common/dto/to-optional-text.ts`.
