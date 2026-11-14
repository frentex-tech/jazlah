# Registry: Errors and error responses

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **AppError** — `src/common/errors/app-error.ts` — the one error class business code throws; options `src/common/errors/app-error-options.interface.ts`.
- **FieldError** — `src/common/errors/field-error.type.ts` — one invalid field in VALIDATION_FAILED details.
- **NonErrorThrownError** — `src/common/errors/non-error-thrown.error.ts` — what the filter logs for a thrown non-Error.
- **Error filter** — `src/common/filters/all-exceptions.filter.ts` — writes every error (`src/common/filters/error-response-body.interface.ts`, `src/common/filters/http-status-error-codes.constants.ts`).
- **ErrorResponseDto** — `src/common/filters/error-response.dto.ts` — the documented error body, with `src/common/filters/field-error.dto.ts`.
- **Language** — `src/common/i18n/resolve-language.ts` — `Accept-Language` to `src/common/i18n/language.type.ts`; `src/common/i18n/localized-text.type.ts`.
- **Validation pipe** — `src/common/pipes/app-validation.pipe.ts` — the global pipe; `src/common/pipes/to-field-errors.ts`.
- **Error codes** — `src/common/errors/error-code.enum.ts` — a new code also needs `src/common/errors/error-messages.constants.ts` and `src/common/errors/error-statuses.constants.ts`. Never rename, remove or reuse one.
