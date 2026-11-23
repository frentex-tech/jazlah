# Database: schema, migrations, conventions, transactions

PostgreSQL 17 with PostGIS through Prisma 7.10.1 (pinned), multi-file schema. Paths are relative to `services/api/`.

## Layout

`prisma/schema.prisma` (generator and datasource only), `prisma/models/<domain>.prisma` (one per domain), `prisma/migrations/`, `prisma.config.ts`; the generated client in `src/infra/database/generated/` is never committed or edited.

## Migrations

1. Every schema change is a Prisma migration made with `pnpm db:migrate`; no manual SQL against a database, no `db push` outside a throwaway database. *Why: the history is the only record of each environment's schema.* CI fails when migrations and schema disagree (`pnpm db:drift`).
2. An existing migration is never edited, renamed or deleted; correct with a new migration. *Why: applied migrations are checksummed.* Only exception: SQL Prisma cannot express (PostGIS, a check constraint), added to a migration you created in this task and have not committed (`pnpm exec prisma migrate dev --create-only --name <name>`, edit, `pnpm db:migrate`).
3. A model goes in the file of the domain that owns it; search `prisma/models/` first.
4. Destructive changes (drop or rename a column or table, narrow a type, a required column without default on a table with rows) need the user's explicit confirmation after you describe the effect on data.
5. Never run `pnpm db:reset` or anything that drops data unless the user asks in this session. Prisma refuses it from an agent without `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`: pass the user's exact words, never your own.
6. Report every migration you add: name and effect.

## Conventions (an exception needs the owner's approval in DECISIONS.md)

7. Primary key `id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid`. *Why: any writer can create ids; they reveal no volume; the error mapper relies on `id`.*
8. Tables plural snake_case (`@@map`), multi-word fields mapped (`@map`), camelCase in code.
9. Timestamps `DateTime @db.Timestamptz(3)` in UTC; `createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(3)`.
10. Money columns are integers ending `_halalas` (`BigInt` when a sum may pass 2^31).
11. Every foreign key is indexed and every relation states `onDelete`.
12. A nullable column has a `///` comment saying when it is null.
12a. Every unique constraint is named `<table>_<columns>_key` (`@@unique([phone], map: "users_phone_key")`). *Why: Prisma 7 with the pg adapter reports a unique violation by name only (17a).*
13. PostGIS columns and geo queries go through the geo helper in `src/infra/database/` once it exists.
14. Ledger tables are insert-only: no update or delete by any migration, repository or script.

## Access from code

15. Only a repository or a CRUD service touches Prisma (R14): it injects `DbContext` and queries through `this.db.client`, read at each query, never stored (inside a transaction it is the transaction's client). Rows become entities in a mapper. Nothing else creates a client.
16. A module reads and writes only its own tables (review rule).
17. Known database errors become `AppError` in the repository through `mapPrismaError` (also for what escapes a transaction); anything else ends as INTERNAL_ERROR. The filter knows nothing about Prisma.
17a. A repository translates the constraints it knows into specific codes (`users_phone_key` → `PHONE_ALREADY_REGISTERED`) and rethrows; other errors go to `mapPrismaError`.
**R20.** No Prisma `*OrThrow` method in `src/modules/`, called or destructured. *Why: its not-found error is a failed query, which ends the transaction (18).* Use `findUnique`/`findFirst`, check for `null`, throw `AppError` NOT_FOUND.

## Transactions (18; detail in `src/infra/database/` doc comments)

- A use case that writes more than one table, or calls another module's service as part of a write, runs in one `TransactionRunner.run(work, options?)`. It is ambient: every query through `DbContext.client` inside, at any depth and across modules, joins it; a nested `run` joins the open one. Never call `$transaction`; no independent inner transaction.
- **A failed query ends the transaction**: `run` rejects with TransactionAbortedError even if the work caught the error. Never catch a database error to carry on: use `upsert` or `INSERT … ON CONFLICT`, and `findUnique` + null check.
- **Nothing outside the database happens inside a transaction**: no HTTP, queue add, message or integration call. *Why: it may roll back, or rerun after a write conflict (P2034: up to 3 times, then TRANSACTION_CONFLICT).* Effects go after the commit: `EventPublisher` or `runAfterCommit` (both wait for the outermost commit, dropped on rollback, each isolated), or an enqueue after `run` returns.
- Exactly-once work uses `IdempotencyRunner.runOnce` inside the transaction (`modules.md`, Jobs 4a).
- *Why: two writes that must agree (an order and its ledger entry) both happen or neither does.*

## Tests

19. Databases in tests: `testing.md` (e2e on `jazla_test`, unit tests without one).
