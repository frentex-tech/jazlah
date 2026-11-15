# Registry: Database

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **Database** — `src/infra/database/` — `DatabaseModule`, `PrismaService` (infrastructure only). [whole folder: internals of the entries below]
- **DbContext** — `src/infra/database/db-context.ts` — the client repositories and CRUD services query through.
- **TransactionRunner** — `src/infra/database/transaction-runner.ts` — opens transactions (`src/infra/database/run-in-transaction.ts`).
- **runAfterCommit** — `src/infra/database/run-after-commit.ts` — a callback after the outermost commit.
- **IdempotencyRunner** — `src/infra/database/idempotency-runner.ts` — `runOnce(operation, key, work)`.
- **mapPrismaError** — `src/infra/database/map-prisma-error.ts` — known database errors to `AppError`.
- **mapConstraintViolation** — `src/infra/database/map-constraint-violation.ts` — a known constraint to its own code (rule 17a), the rest as `mapPrismaError`.
