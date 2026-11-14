# Database: schema, migrations, conventions, transactions

PostgreSQL 17 with PostGIS through Prisma 7.10.1 (pinned), multi-file schema. Paths are relative to `services/api/`.

## Layout

`prisma/schema.prisma` (generator and datasource only), `prisma/models/<domain>.prisma` (one per domain), `prisma/migrations/`, `prisma.config.ts`; the generated client in `src/infra/database/generated/` is never committed or edited.

## Migrations

1. Every schema change is a Prisma migration made with `pnpm db:migrate`; no manual SQL against a database, no `db push` outside a throwaway database. *Why: the history is the only record of each environment's schema.*
2. An existing migration is never edited, renamed or deleted (a diff adds migration files, never modifies one); correct with a new migration. *Why: applied migrations are checksummed.* Only exception: SQL Prisma cannot express, added to a migration you created in this task and have not committed (`pnpm exec prisma migrate dev --create-only --name <name>`, edit, `pnpm db:migrate`), as the first migration does for PostGIS.
3. A model goes in the file of the domain that owns it; search `prisma/models/` first.
4. Destructive changes (drop or rename a column or table, narrow a type, a required column without default on a table with rows) need the user's explicit confirmation after you describe the effect on data.
5. Never run `pnpm db:reset` or anything that drops data unless the user asks in this session. Prisma refuses it from an agent without `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`: pass the user's exact words, never your own.
6. Report every migration you add: name and effect.

## Conventions (an exception needs the owner's approval in DECISIONS.md)

7. Primary key `id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid`. *Why: any writer can create ids; they reveal no volume; the error mapper relies on `id`.*
8. Tables plural snake_case (`@@map`), multi-word fields mapped (`@map`), camelCase in code.
9. Timestamps `DateTime @db.Timestamptz(3)`, in UTC; `createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(3)`.
10. Money columns are integers ending `_halalas` (`BigInt` when a sum may pass 2^31).
11. Every foreign key is indexed and every relation states `onDelete` (Restrict, Cascade or SetNull).
12. A nullable column has a `///` comment saying when it is null.
12a. Every unique constraint is named `<table>_<columns>_key` (`@@unique([phone], map: "users_phone_key")`). *Why: Prisma 7 with the pg adapter reports a unique violation by name only (17a).*
13. PostGIS columns and geo queries go through the geo helper in `src/infra/database/` once it exists.
14. Ledger tables are insert-only: no update or delete by any migration, repository or script.

## Access from code

15. Only a repository or a CRUD service touches Prisma (R14, `code-structure.md`): it injects `DbContext` and queries through `this.db.client`, read at each query, never stored: inside a transaction that is the transaction's client. Rows become entities in a mapper. Nothing else creates a client.
16. A module reads and writes only its own tables (review rule).
17. Known database errors become `AppError` in the repository through `mapPrismaError` (also applied to what escapes a transaction; the mapping is in its doc comment); anything else ends as INTERNAL_ERROR. The filter knows nothing about Prisma.
17a. A repository translates the constraints it knows into specific codes (`users_phone_key` → `PHONE_ALREADY_REGISTERED`) and rethrows; other errors go to `mapPrismaError`.
**R20.** No Prisma `*OrThrow` method (`findUniqueOrThrow`, `findFirstOrThrow`) in `src/modules/`, called or destructured. *Why: its not-found error is a failed query, which ends the transaction (rule 18).* Use `findUnique`/`findFirst`, check for `null`, throw `AppError` NOT_FOUND.

## Transactions (18)

- A use case that writes more than one table, or calls another module's service as part of a write, runs in one transaction: `TransactionRunner.run(work, options?)`. It is ambient (AsyncLocalStorage): every query through `DbContext.client` inside, at any depth and across modules, joins it; a nested `run` joins the open one and its options are ignored. Never call `$transaction`; an independent inner transaction is not supported.
- **A failed query ends the transaction.** PostgreSQL turns its COMMIT into a silent ROLLBACK, so the scope is marked failed and `run` rejects with TransactionAbortedError even if the work caught the error. Never catch a database error to carry on: use `upsert` or `INSERT … ON CONFLICT`, and `findUnique` + null check (R20).
- **Nothing outside the database happens inside a transaction**: no HTTP, queue add, message or integration call. *Why: it may roll back, or rerun after a write conflict.* Effects go after the commit: `EventPublisher`, `runAfterCommit`, or an enqueue after `run` returns.
- Write conflicts (P2034) rerun the whole transaction up to 3 times with jittered delays, dropping that attempt's callbacks, then TRANSACTION_CONFLICT (409).
- Options `timeout`, `maxWait`, `isolationLevel` default from config (`DATABASE_*` in `.env.example`).
- Events and `runAfterCommit` callbacks wait for the outermost commit and are dropped on rollback; one registered after the transaction ended runs at once if it committed, is dropped with a warn if it rolled back. Each callback runs isolated: a throw or rejection is logged and stops nothing.
- Work that must happen exactly once uses `IdempotencyRunner.runOnce` inside the transaction (`modules.md`, "Jobs" 4a); it throws outside one.
- *Why: two writes that must agree (an order and its ledger entry) both happen or neither does.*

## Tests

19. e2e tests use `jazla_test` (`scripts/e2e.mjs` derives it, migrates it, and says in one line when the database is down); each test deletes the rows it creates. Unit tests never need a database.
