# Registry: the index of shared code

What exists, by area. Before writing anything, read this index, then open the area file of **every area your task touches**; confirm in the code, which is the truth. Paths are relative to `services/api/`.

**Keeping it current.** An area file (`.claude/registry/<area>.md`, not loaded by default) has one line per building block: `- **Name** — \`path\` — a few words`; the detail is in that file's doc comment. The change that adds, renames, moves or deletes shared code (under `src/common/`, `src/infra/`, `src/integrations/`, and each module export) updates the line in its area file; a new area also gets its line below. Every shared source file is named by a line or sits in a folder whose line ends `[whole folder: <reason>]` (only a folder that is one unit); `node .claude/hooks/check-registry.mjs` enforces it, and fails on an area file not listed here.

**Lookup tables** (error codes, queue names, upload purposes and each audience's, configured rate limits, audiences, the environment schema, SMS providers): extend, never duplicate. Their lines are in the area files.

**Reserved names** (decided, not built; create them only under these names and record the path): **the realtime publishing port** in `src/infra/realtime/` (beside the gateway modules never import); **the time helper** (Asia/Riyadh business calendar); **the masking helper** (phones and addresses in logs; the phone part is `maskPhoneNumber`, area phone).

**Reference implementations** (the first of each kind, which later ones copy): ARCHITECTURE.md, "Reference implementations".

<!-- entries-start: the check script reads every backticked path below this line, and the area files -->

## Used by nearly every task

- **AppError** — `src/common/errors/app-error.ts` — the one error class business code throws; codes in `src/common/errors/error-code.enum.ts`.
- **DbContext** — `src/infra/database/db-context.ts` — the client repositories and CRUD services query through.
- **TransactionRunner** — `src/infra/database/transaction-runner.ts` — opens transactions.
- **CurrentUser** — `src/common/decorators/current-user.decorator.ts` — the request's signed-in user.

## Areas

- **config** — `.claude/registry/config.md` — typed config, the environment schema, SMS provider names.
- **errors** — `.claude/registry/errors.md` — AppError, error codes, the error filter and body, validation pipe, language.
- **http** — `.claude/registry/http.md` — HTTP setup, API docs, error documentation, request id, health.
- **rate limiting** — `.claude/registry/rate-limiting.md` — `@RateLimit`, configured limits, the keyed `RateLimiter`.
- **auth** — `.claude/registry/auth.md` — audiences, the global guards, the vendor status checker, `@Public()`, `@CurrentUser()`, the auth module.
- **users** — `.claude/registry/users.md` — `UsersService`: users by phone, staff access.
- **media** — `.claude/registry/media.md` — `MediaService`, upload purposes, file type detection, file names.
- **database** — `.claude/registry/database.md` — Prisma setup, `DbContext`, transactions, after-commit, idempotency, error mapping.
- **queue** — `.claude/registry/queue.md` — queue registration, processors, job ids and options, schedules, queue names.
- **events** — `.claude/registry/events.md` — domain event base class, the event bus.
- **runtime** — `.claude/registry/runtime.md` — Redis, logger, shutdown deadline, `withTimeout`.
- **phone** — `.claude/registry/phone.md` — Saudi mobile and contact-number normalising, masking, LIKE escaping, the DTO decorator, Arabic digits, invisible format characters.
- **storage** — `.claude/registry/storage.md` — the storage integration and its fake.
- **sms** — `.claude/registry/sms.md` — the SMS integration and its fake, SMS text measuring.
- **pagination** — `.claude/registry/pagination.md` — keyset lists: page query, cursor, `Page`, `keysetAfter`.
- **audit** — `.claude/registry/audit.md` — `AuditLogWriter`.
- **crypto** — `.claude/registry/crypto.md` — AES-256-GCM for data at rest.
- **money** — `.claude/registry/money.md` — `Money`: all halala arithmetic.
- **vendors** — `.claude/registry/vendors.md` — `VendorsModule` (the vendor status checker), the platform vendor, `VendorDirectory`.
- **catalog** — `.claude/registry/catalog.md` — `CatalogModule`.
- **customers** — `.claude/registry/customers.md` — `CustomersModule`: profiles, marketing consent, addresses.
- **coverage** — `.claude/registry/coverage.md` — `CoverageModule`: delivery zones, `CoverageService` (is a point covered).
