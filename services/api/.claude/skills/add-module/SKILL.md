---
name: add-module
description: Add a business module to the JAZLA API, or add a use case, an endpoint, a job processor or an event subscriber to an existing module (orders, checkout, payments, refunds, wallet, finance, or any other domain under src/modules). Use for any task that adds or changes business behaviour, a controller, an endpoint, a DTO, an entity, a state transition, a ledger entry or a repository.
---

# Add a module, a use case or an endpoint

Paths are relative to `services/api/`. Rules: `.claude/rules/modules.md` and `.claude/rules/code-structure.md`. Layout, audiences and route prefixes: `.claude/ARCHITECTURE.md`.

Work through the steps in order. Do not write a file before step 4.

## 0. Finance or invoicing? Check the blocking questions

Three business questions are not answered (`.claude/DECISIONS.md`): who the seller of record is on a partner merchant's order, whether kitchens are paid through the platform, and whether Geidea settles to sub-merchants. If the task designs anything in `finance` or `zatca` that depends on one of them, stop and ask before going further. Nothing else waits on them.

## 1. Find what exists

1. Read `.claude/REGISTRY.md`: "Module exports", "Reference implementations" and the shared sections.
2. List `src/modules/`. If a module for this domain exists, you are extending it, not creating one beside it.
3. For each thing the task needs (a guard, a decorator, a DTO base, an error code, a pagination type, a money or time operation), search before you write. Procedure: `.claude/rules/code-structure.md`, section 5.

## 2. Choose the shape, or confirm it

- **orders, checkout, payments, refunds, wallet, finance:** four layers.
- **Any other module, new or existing:** controllers + service + dto. If the task would add a state machine or money logic to it, stop and propose promoting it to four layers (`.claude/rules/modules.md`).
- There is no inventory module: availability belongs to `catalog` and slot capacity to `scheduling`.

Then open the reference module of that shape from the registry and mirror it.

## 3. Pin down the behaviour

List, from the task: the audience of each endpoint, the inputs, the result, each rule that can reject the request, each state change, each amount calculated. If any of these is not stated, ask. Do not fill a gap in a business rule with a reasonable guess: prices, fees, limits, cut-off times and refund rules are the client's decisions.

## 4. Write the files, one thing per file

**A use case in a four-layer module** usually touches:

| Layer | File |
|---|---|
| `api/` | the method on the controller of the endpoint's audience (`api/controllers/<audience>.controller.ts`), and one DTO file per request and per response in `api/dto/` |
| `application/` | one new use case class with one public method |
| `domain/` | the entity or state machine change, any new port, any new event, each in its own file |
| `infrastructure/` | the repository method that implements a new port method, and the mapper if a shape changed |

**An endpoint in a CRUD module:** the method on the audience's controller (`controllers/<audience>.controller.ts`), the service method, the DTO files.

**Every endpoint is documented** (`.claude/rules/http.md`): the response DTO in `@ApiOkResponse({ type })` (or the status's decorator), `@ApiErrorResponses(...)` with every code it can return (RATE_LIMITED included), a DTO with `@ApiProperty` on every property for the body and the query, `@ApiTags` on the controller and `@ApiBearerAuth(BEARER_AUTH_SCHEME)` when it needs a login. An endpoint open to abuse (OTP, login, anything that sends a message or costs money) gets `@RateLimit({ name, limit, windowMs })` on a named counter, with `failClosed: true` when an unlimited request would cost money or be a security risk (OTP), and then SERVICE_UNAVAILABLE in its `@ApiErrorResponses`.

While writing:

- A new operation is a new use case class. Do not add a method or a flag to a use case that already works.
- An order's status changes only in the state machine in the orders domain layer. From any other module, ask the orders module through what it exports. The same holds for every other state machine.
- An endpoint goes in the controller of its audience, under that audience's route prefix.
- Reacting to another module: add a subscriber in your module to its event on the event bus. Background work (processor extends `JobProcessor`, implements `handle` only; R17, R18): add the queue's name to `QUEUE_NAMES` in `src/infra/queue/`, register the queue in your module with `QueueRegistrationModule.register`, and put the processor in your module, extending `JobProcessor`, provided with `...provideWorkers(...)` with any scheduler (never in `providers` directly): payloads carry ids, the processor is idempotent, and a once-only operation uses `buildJobId`. Realtime updates: publish through the publishing port, never the gateway. (`.claude/rules/modules.md`, "Other modules, events, jobs")
- Money that moved is recorded by `finance` as a new ledger entry. A ledger entry is never updated or deleted.
- Amounts go through `Money` (`src/common/money/`). Business dates go through the shared time helper. Errors are `AppError` with an UPPER_SNAKE_CASE code from the list in `src/common/errors/`. (`.claude/rules/invariants.md`)
- Calls to another module go through its exports. Calls to an external service go through the integration's `index.ts`.
- A schema change is a new Prisma migration, in the schema file of the owning domain (`.claude/rules/database.md`).

## 5. Tests

- A unit test for each use case: the success path and every rejection from step 3, using the in-memory fakes of the ports in the module's `domain/fakes/` (`in-memory-<name>.fake.ts`, plain TypeScript, excluded from the build).
- An e2e test for each endpoint, covering every case that applies to it among success, invalid input, authentication and ownership.
- Details: `.claude/rules/testing.md`.

## 6. Check the boundaries

- Run `pnpm lint`. The boundary rules R0 to R8 (`.claude/rules/code-structure.md`, section 2) catch a `domain/` file that imports a package or another layer, an import of another module past its `index.ts`, an import of an integration past its `index.ts`, and `infra` importing a module. Fix the design, never the rule.
- A new module needs an `index.ts` that exports what other modules may use; other modules can import nothing else from it.
- `Grep` the module for the realtime gateway class: there must be no hit (modules publish through the publishing port; lint does not check this one).
- Look at each class file you wrote for a top-level `interface`, `type`, `enum` or constant: each moves to its own file.

## 7. Verify

Run `pnpm openapi:generate` and read the diff of `openapi.json`: it is what the mobile app will see. Then run lint, `pnpm lint:rules`, `pnpm openapi:check`, typecheck or build, unit tests and e2e tests with the commands in `CLAUDE.md`, after your last edit. Keep the real output.

## 8. Record it

1. Anything the module now exports for others: a line under "Module exports" in `.claude/REGISTRY.md`.
2. Anything you added to a shared folder: its line in the registry.
3. First module of its shape: fill in the "Reference implementations" table.
4. A decision the next module should repeat: a line in the log in `.claude/DECISIONS.md`.
5. Run `node .claude/hooks/check-registry.mjs`.

## 9. Report

Use the report format in `CLAUDE.md`.
