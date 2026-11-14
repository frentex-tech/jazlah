# Review checklists

Questions to ask of the code under review, by concern. Apply every section the change touches; say under "Checked and sound" which ones you applied. They are prompts for looking, not findings to produce: a question becomes a finding only when you can name the input or sequence that shows the problem (`SKILL.md`, rule 3). Nothing here repeats what lint, the registry check or the drift checks enforce.

Names in `code font` are this project's building blocks; the registry says where each lives.

## 1. Correctness

- **Twice at once.** For each use case and service method: what happens when two requests with the same input run concurrently (two verifications of one code, two refreshes of one token, two confirmations of one upload, two placements of one order)? Is the check and its effect one atomic statement (a conditional `updateMany` whose count is checked, a unique constraint, a row lock), or a read followed by a write that both requests can pass?
- **Half done.** For each operation with several steps: if step N throws, what is left behind by the steps before it? Is that state valid, and can the operation be retried from it?
- **Commit before refusing.** Where a refusal must leave a trace (an attempt counted, a token family revoked): does the use case return an outcome from its transaction and throw after it, or throw inside the transaction and roll its own write back?
- **Edges.** Exactly at expiry (`<` or `<=`), the last allowed attempt, zero, one, an empty list, a null organisation, the longest allowed string, Arabic-Indic digits, each accepted form of a phone number.
- **Time.** Is "now" taken once per operation from an injected clock, or read in several places that can disagree? Is any business-calendar decision (today, a slot's day, a cut-off) made in UTC or server time instead of Asia/Riyadh?
- **Order.** Does the code assume an order nothing guarantees: an event handled before the response, one job before another, `findFirst` or `findMany` without `orderBy` returning "the latest"?
- **Claims.** Does the code do everything the pull request and its issue say? A claimed behaviour with no code behind it is a finding.
- **Configuration.** Is each default safe in production? Is a variable that production needs refused at startup when missing (`src/config/env.schema.ts`), or does a development default leak through? Does behaviour differ by `NODE_ENV` in a way no test sees?
- **Startup and shutdown.** Can something registered at module init fail silently or take the application down? Is work still running at shutdown waited for or cut off?

## 2. Money

- Is any amount not an integer number of halalas: a decimal `number`, a `Decimal` or `Float` column, a string?
- Is there arithmetic on an amount outside `Money` (`src/common/money/`): `/ 100`, `* 100`, `toFixed`, `parseFloat`, `Math.round`, a percentage computed inline? If `Money` lacked the operation, was it added there with tests for zero, one halala and rounding?
- **VAT.** Prices include 15% VAT. Where VAT is taken out of an inclusive price, where does the rounding go? Do net and VAT add back to the gross to the halala, for 1 halala, 99 halalas and a whole-animal amount?
- **Splits.** Commission and vendor payable, a partial refund, a weight adjustment: do the parts sum back to the total exactly? Which party receives the remainder halala, and is that deterministic and tested with an amount that does not divide evenly?
- Is a stored total edited in place where the business needs a new record (refund, adjustment)? Can a sum pass 2^31 halalas (about SAR 21.4 million) in an `Int` column?
- **Ledger.** Does every money movement write its ledger entry in the same transaction as the thing that caused it? Is any ledger row updated or deleted? Is a correction a new entry referring to the original? Are balances derived from entries?
- Can a refund exceed what was captured, or be applied twice by a retry? Where is the idempotency key?
- Is a unit conversion for a gateway done anywhere but inside the provider?
- Does the change design anything that depends on the three open finance questions in `.claude/DECISIONS.md`?

## 3. Transactions and data

- Inside `TransactionRunner.run`: is there an HTTP call, an integration call (`SmsService`, `StorageService`, a payment), a queue `add`, a Redis write or `RateLimiter.consume`? The transaction can roll back, or rerun up to three times after a write conflict, repeating the effect.
- Is a database error caught inside a transaction and the work carried on? The transaction is already aborted. It should be an `upsert`, `ON CONFLICT`, or `findUnique` and a null check.
- Does a use case write two tables, or call another module's service as part of a write, without one `run` around it?
- Work that must happen exactly once (a webhook, a capture, a ledger posting): is it keyed in the database (`IdempotencyRunner.runOnce`, a unique constraint), or only by `buildJobId`, which stops duplicates only while the job is still kept?
- Is an event used for an effect whose loss is not acceptable? Delivery is in memory: a crash between commit and dispatch loses it.
- After the commit: if the process dies before the `runAfterCommit` callback or the enqueue, is the missing effect recovered by anything?
- When a transaction reruns after a conflict, does the work function also change state outside the database (an array it pushes to, a token generated outside and reused, a counter) that is then doubled or stale?
- Does the module read or write another module's tables?
- Is uniqueness enforced only by a check in code, with no constraint behind it?
- Soft state (`deactivated_at`, `revoked_at`, `disabled_at`, a status): does **every** query that should ignore such rows filter them?
- Do rows accumulate without bound and without cleanup (expired challenges, tokens, idempotency keys)? Decide: real within a year, or "acceptable for current scale" with a trigger.

## 4. Database and performance

- A query inside a loop, or `Promise.all` over `findUnique`: should it be one `findMany` with `in`, or a join?
- For each new `where` and `orderBy`: which index serves it? Check `@@index` and `@@unique` in `prisma/models/` and the migration SQL; when unsure, `EXPLAIN` it on the local database.
- Is every list bounded: pagination with a maximum page size and a stable order (a tiebreak on `id`)? Any `findMany` without `take` on a table that grows with users or orders?
- Does a query fetch whole rows or deep relations where a few columns are used? Are large payloads put in responses, jobs or events?
- Is a transaction held open across slow work that is not a query (hashing, a network call, a long loop)?
- Does every outbound call (vendor HTTP, object storage, SMS) have a timeout (`withTimeout` or the client's own)? Can an awaited call on the request path hang?
- Redis: keys without a TTL, a scan by pattern, a round trip per item in a loop?
- **The hot path.** What does every authenticated request now cost: a database read in the global guard, a signature check, a hash? Is that one indexed read at most?
- **Eid al-Adha.** At many times the ordinary order rate for a few days: does anything queue behind one row or lock (a counter, a slot's capacity), exhaust the connection pool, or send one message per item?

## 5. Security

- **Audience.** Is each new endpoint in the controller of the right audience (`public/`, `customer/`, `vendor/`, `kitchen/`, `admin/`)? Is each `@Public()` justified?
- **Ownership.** Does every query that loads a record by an id from the request also filter by its owner: `userId` from `@CurrentUser()` for a customer, `organisationId` for vendor and kitchen staff? Is an owner id ever accepted from the body, query or path? Can staff of one organisation read or change another's record by supplying its id? Where existence is sensitive, is "not yours" answered exactly like "not found"?
- **Revocation.** When a user is disabled or a staff access deactivated, when does access actually end: at once, or when the access token expires? Is that written down as decided?
- **Input.** Is every body, query and path parameter a validated DTO or pipe? Does a malformed id reach Prisma and come back as a 500? Are strings and arrays bounded, numbers integer and ranged, nested objects validated?
- Is a DTO spread straight into Prisma `data`, letting a client set a column it should not?
- **Secrets and personal data.** Does any log line hold an unmasked phone (`maskPhoneNumber`), an OTP code, a token, an authorization header, an SMS text or a whole body? Does an error's `details` or a response body carry internals: a hash, a column the client does not need, another user's data?
- **Codes and tokens.** Generated with `node:crypto`, never `Math.random`? Compared in constant time? Stored hashed or keyed, never in the clear? Expiry enforced on the server? Single use enforced atomically (see section 1)?
- **Enumeration.** Do two requests that differ only in whether a phone, user or record exists get the same status, body and headers, and take about the same path (the same queries, the same wait for an SMS)?
- **Abuse.** Does every endpoint that sends a message, costs money or lets a secret be guessed have `@RateLimit` with `failClosed: true`, and a limit keyed by its target (the phone, through `RateLimiter`) as well as by address? Are the numbers sane, and in config?
- **SQL.** Any `$queryRawUnsafe`, or a raw query built by concatenation? A sort column or direction taken from the request without an allowlist?
- **Uploads.** Purpose in `UPLOAD_PURPOSES`, type detected from the bytes, size limited by the upload policy, file name sanitised, private objects never given a public URL?
- **Webhooks.** Signature verified over the raw body before anything else happens? Replays refused?
- **Tokens (JWT).** Algorithm pinned, `exp` required, audience checked, secrets required in production?
- Is helmet or CORS relaxed for the whole application? Does the server fetch a URL supplied by a client?

## 6. Errors and API contract

- Is every failure a client can see an `AppError` with a code from `error-code.enum.ts`? Does each new code have Arabic and English messages and a default status? Was any existing code renamed, removed or given a new meaning? Are two situations told apart only by message text?
- Does each status fit the situation (401, 403, 404, 409, 410, 422, 429, 503)? Is `Retry-After` sent where the client must wait?
- Is the Arabic message correct, natural Arabic that says what the English says? Is any text a user reads (an SMS, a notification) hard-coded outside the catalogue, or in one language only?
- For each endpoint, walk the handler and everything it calls: does `@ApiErrorResponses` list **every** code that path can return (the guard's 401s and 403, validation, the rate limit, each domain code, SERVICE_UNAVAILABLE for a fail-closed limit)? Is the documented success DTO what is really returned?
- Is the response built by a mapper into a response DTO, or is an entity or database row returned as it is, so that a new column leaks later?
- Read the diff of `openapi.json`: a removed or renamed field, a new required request field, a changed type, status or enum value. Is the endpoint already released (on `main`)? Then it is a breaking change to the generated mobile client.
- Amounts as integer halalas, timestamps in UTC ISO form, lists paginated the same way as existing lists?
- A POST the mobile app will retry on a bad network (placing an order, paying): does a repeat create a duplicate?

## 7. Jobs and events

- **Twice, and at the same time.** Run `handle` twice with the same job in your head: is the second run a no-op? Run two copies together (a stalled job and its retry): is the check and its effect one atomic step?
- Does a payload carry ids only? No record, no phone or address, no secret: payloads sit in Redis and in logs.
- What is thrown on failure? Is something that retrying cannot fix thrown as `UnrecoverableError`? After the last attempt fails, what state is the business record in, and who finds out?
- Does a vendor call made from a job carry an idempotency key? Is progress made before a retry repeated?
- Does long work pass the abort signal on, so that shutdown (25 s) cancels it cleanly and the retry is safe?
- A scheduled job: is its batch bounded? Are overlapping runs, or two instances, safe?
- Events: a past-tense fact, published inside the transaction that makes it true, with ids only? Is every subscriber idempotent, free of business rules, and enqueueing a job where the effect must happen?
- Detached work (a promise not awaited by the request): are its errors handled, and is it tracked so shutdown waits for it and names it if it hangs?
- Is the enqueue after the commit? If `add` then fails (Redis down, 503), the database has changed and the job does not exist: what recovers that?

## 8. Design

- **Layers** (four-layer modules): a business rule in a controller or use case that belongs in an entity or state machine; a Prisma or HTTP type crossing into `domain/` or `application/`; a use case with two public methods, or two operations behind a flag; a port that merely mirrors a table.
- **Modules:** logic about one domain living in another's module; a state changed outside the state machine that owns it; a CRUD-shaped module that now holds a state machine or money logic and should have been proposed for promotion.
- **One user.** A new interface, token, factory, option or generic helper with a single caller and no second in sight, where the plain thing would do. A port needed as a test seam is not this.
- **Reimplemented.** Read the registry index and the area files: does the change rewrite something that exists (`withTimeout`, `maskPhoneNumber`, `normalizeSaudiMobileNumber`, `toLatinDigits`, `mapPrismaError`, `buildJobId`, `runAfterCommit`, `RateLimiter`, the clock, the error catalogue)?
- **Placement.** Something with business meaning in `src/common/` or `src/infra/`? Plumbing inside a business module that the next module will need, and will have to import from it or copy?
- **The next module.** What will catalog, orders, checkout and payments need from this change (the signed-in user and organisation, ownership checks, pagination, idempotency)? Will they build on it, or work around it? Would a second SMS provider, another audience or another kind of organisation be one file and one registration?
- An architectural decision made in code with no entry in `.claude/DECISIONS.md`? Code that contradicts a decision in force?
- A branch on a provider or vendor name in a working class?

## 9. Clean code

- **Names that mislead:** a boolean named for its opposite; a `get` or `find` that writes; a `validate` that also changes state; a duration or amount without its unit (`ttl`: seconds or milliseconds; `amount`: halalas?).
- A function that does several things in phases separated by comments; a flag parameter that selects between two behaviours; nesting several levels deep.
- **Dead code:** an unused export, parameter or branch; code that cannot be reached; commented-out code; a TODO with no issue.
- **Magic values:** a duration, limit, length or status written inline; the same literal in two places.
- **Comments:** one that says what the next line does instead of why; one the code now contradicts; a shared building block without the doc comment the registry relies on.
- Duplication inside the change that is not a project rule. One controller per audience is a rule, not duplication.
- A `catch` that logs and continues, rethrows unchanged, or turns every error into one code.
- Types: `string` where a union exists (`Audience`); an optional field meaning two things; a non-null `!` or an `as` that hides a mismatch.

## 10. Tests

- For each rule in the change, security and money first: **which test fails if the rule is removed?** Name it. If none, that is a finding (high for a security or money rule). Check one or two by removal in a scratch copy (`SKILL.md`, step 6).
- Assertions on the wrong thing: the status but not the body or the stored state; `toBeDefined` or `toBeTruthy`; "it throws" without which code; a mock was called, rather than the effect happened.
- **Fakes.** Does the in-memory fake behave like PostgreSQL where the test depends on it: uniqueness, a conditional update's atomicity, ordering, nulls? A use case proven only against a fake more permissive than the database is not proven: is the real repository covered by an e2e test?
- Is the class under test, or the collaborator holding the behaviour, mocked away?
- Does a test depend on the real clock, a sleep, the date, the timezone, test order, or state shared between suites (rows, Redis keys, counters not named per suite)?
- e2e for each endpoint, as they apply: success, invalid input, no token, a token of another audience, another user's or organisation's record, the rate limit. Does it delete its rows?
- Is a concurrency rule tested with concurrent calls, or only one after the other?
- Is an "indistinguishable" claim tested by comparing whole responses (status, body, headers) and side effects, or only the status?
- In the diff of the test files: a test skipped, deleted or loosened?
- For a processor or subscriber: is there a test that the same input twice applies the effect once?

## 11. Migrations

- Read each new migration's SQL, not only the Prisma model. Does it do what the model and the pull request say?
- **Destructive:** a dropped or renamed column or table, a narrowed type, NOT NULL added to a table with rows without a default or backfill, an enum value removed. Was the effect on data described and confirmed by the owner?
- **Locking**, on a table that will be large (orders, ledger, users): an index built without `CONCURRENTLY`, a constraint validated over the whole table, a rewrite of the table. On a new or empty table say "acceptable for current scale".
- Was an existing migration edited, renamed or deleted?
- Each foreign key: indexed, and `onDelete` chosen on purpose? Would `Cascade` delete money or audit history? Would `Restrict` block a deletion the business needs?
- Each nullable column: does its `///` comment give a real reason? Are unique and check constraints named? Timestamps `timestamptz(3)`, money in integer `_halalas`?
- An invariant kept only in code that the database could keep (unique, check, foreign key, NOT NULL), where it protects security or money?
- A new enum value used in the same migration that adds it (PostgreSQL refuses that inside one transaction)? A data backfill mixed into a schema migration?
- Hand-written SQL (a check constraint, PostGIS): present in the migration, and correct for every row the application can write?
