# Code structure: folders, boundaries, files

Where code goes and what may import what. The layout is in `.claude/ARCHITECTURE.md`; if the two disagree, tell the user. Paths are relative to `services/api/`.

## 1. Choosing the folder (first row that fits)

| The code… | Goes in |
|---|---|
| reads environment variables or defines typed config | `src/config/` |
| calls a service outside our system | `src/integrations/<capability>/` |
| wraps infrastructure we run (health, HTTP, API docs, rate limiting, database, queue, realtime, event bus, redis, logger, shutdown) | `src/infra/<name>/` |
| is plumbing with no business meaning (errors, money, events base, filters, guards, decorators, pipes) | `src/common/<kind>/` |
| means something to the business | `src/modules/<domain>/` |

"No business meaning" = could be copied unchanged into another product; later products build on common, infra and integrations. No shared package for hand-written code. `src/infra/queue/` holds the connection, defaults, queue names and job helpers only; `src/infra/realtime/` the gateway, rooms and publishing port; processors, subscribers and business logic belong to their module.

## 2. Boundaries (`pnpm lint`, proven by `pnpm lint:rules`)

A message starts with its rule id. A boundary error means the design is wrong: restructure; never silence a rule or add an exemption; if a rule seems wrong, stop and ask. Elements: `config`, `common`, `infra`, `integration` (each `src/integrations/<name>/`), `module` (each `src/modules/<name>/`), `entry` (files directly in `src/`). Imports inside an element are allowed except as R8 says. Other ids: R9 to R13 and R21 in `invariants.md`, R19 in `http.md`, R20 in `database.md`. Next id: R22.

| Id | Rule | Why / instead |
|---|---|---|
| R0 | Every import from `src/` fits a rule below (default: refuse, local files outside every element included), and every file belongs to an element: nothing loose in `src/modules/` or `src/integrations/`, no other top-level folder. | Unknown code escapes every rule. |
| R1 | `common` imports only `common`, `config`. | Everything imports it; depend on an interface declared in common. |
| R2 | `config` imports only `config`, `common`. | Everything reads it. |
| R3 | `infra` imports only `config`, `common`, `infra`. | Reusable, acyclic: react through events, the module's processor, the realtime port. |
| R4 | An integration imports only `config`, `common`, `infra`, itself. | Data arrives as arguments; a module combines integrations. |
| R5 | A module never imports the entry files. | Cycle; use injection. |
| R6 | An integration is imported from outside only through its `index.ts`. | A vendor swap touches no business code. |
| R7 | A module is imported from outside only through its `index.ts`. | A missing export is a minimal change, named in your report. |
| R8 | A module's `domain/` imports only its own `domain/` and the plain parts of common (`DOMAIN_SAFE_COMMON` in `eslint.config.mjs`: async, errors, events, i18n, money; no DTO), which themselves import no package or Node core module. | Rules testable without framework or database: declare a port, implement it in `infrastructure/`. A package for `domain/` needs the owner's approval, a DECISIONS line and a fixture. |
| R14 | The Prisma client is imported only by a four-layer module's `infrastructure/`, a CRUD module's root `<module>.service.ts`, and `src/infra/database/`. No module imports or injects `PrismaService`. | Queries stay findable, one pool: `DbContext` and `TransactionRunner` (`database.md`). |
| R15 | `registerQueue(Async)` appears only in `src/infra/queue/`, however reached. | `QueueRegistrationModule.register` (`modules.md`). A name built at run time is a review rule. |
| R16 | Only `src/infra/event-bus/` imports `@nestjs/event-emitter`. | The wrapper types events and waits for the commit. |
| R17 | `WorkerHost`, `QueueEvents*`, `@OnQueueEvent`, `FlowProducer` and their helpers only in `src/infra/queue/`. | They bypass logging, bounded add and shutdown: extend `JobProcessor`, or ask. |
| R18 | A `JobProcessor` subclass defines neither `process` nor `_worker`. | Implement `handle(job, signal)`. |

**Changing the layout** (a top-level folder, a layer, what may import what) is one change: the policy in `eslint.config.mjs` with a new id; its row here; violating and conforming fixtures in `lint-fixtures/src/` (first line `// lint-rule: Rn violates|conforms`, or `support`; a closed bypass becomes a fixture); the id in `scripts/check-lint-rules.mjs`; for a top-level folder also the aliases, `LOOSE_FILES` and ARCHITECTURE.md. Then `pnpm lint` and `pnpm lint:rules`.

## 3. One declaration, one file

Every DTO, interface, type, enum and constant set has its own file named for it; a class file (controller, service, use case, provider, repository, guard) holds that class only; `index.ts` only re-exports. No "small" exception. *Why: things are found by file name; what is not found is written twice.* An integration groups its port types in its types file and its errors in its errors file.

## 4. File names

Kebab-case, saying what it is; never a bare `utils.ts`, `helpers.ts`, `types.ts`, `constants.ts`. If code differs, follow the code and correct this.

- Module: `<audience>.controller.ts` (public, customer, vendor, kitchen, admin) in `api/controllers/`; `<verb>-<noun>.dto.ts`, `<noun>-response.dto.ts` in `api/dto/` (CRUD: `controllers/`, `dto/`); `<verb>-<noun>.use-case.ts` in `application/`; `.entity.ts`, `.state-machine.ts`, `domain/events/<name>.event.ts`, `domain/ports/<name>.port.ts`, `domain/fakes/in-memory-<name>.fake.ts`; `prisma-<name>.repository.ts`, `<name>.mapper.ts` in `infrastructure/`; `<name>.processor.ts`, `<name>.subscriber.ts`.
- Anywhere: `.interface.ts`, `.type.ts`, `.enum.ts`, `.constants.ts` beside their consumers; one exported function `<verb>-<noun>.ts`; `<name>.guard.ts` (decorator, pipe, filter, interceptor) in `src/common/<kind>/`; infra DTOs in `src/infra/<name>/dto/`; config `<name>.config.ts` + `<name>-config.type.ts`.
- Integration: `<capability>.port.ts`, `.types.ts`, `.errors.ts`, `.service.ts`, `.module.ts`, `index.ts`, `providers/<vendor>.provider.ts`, `providers/fake.provider.ts`.
- Tests: `<file>.spec.ts` beside the file, `test/<module>.e2e-spec.ts`, support code in `test/support/`.

## 4a. Aliases

`@config/*`, `@common/*`, `@infra/*`, `@integrations/*`, `@modules/*` across top-level folders, relative imports inside one; no bare or narrower alias. Kept in step in `tsconfig.json`, `test/jest-e2e.json`, `lint-fixtures/tsconfig.json`.

## 5. Find before you build

Read the registry; search the code by concept with synonyms and by kind (`src/**/*.guard.ts`); use what fits, extend what nearly fits (with tests; ask if callers would change), or create it in the right shared folder and register it. Never copy a file and adjust the copy. Report what you searched for and found.

## 6. SOLID, as checks

One reason to change per class (a use case has one public method; a controller parses, calls one method, maps). Extend by adding a file: a new vendor, channel or case is a new file plus one registration, never a `case`/`if` on a provider name in a working class. An implementation honours its whole interface (no "not supported": split the port). Small interfaces, injected through tokens; no `new SomeProvider()` outside the integration's module file.
