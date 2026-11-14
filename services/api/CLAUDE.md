# CLAUDE.md — JAZLA API (`services/api`)

The backend of JAZLA: a NestJS modular monolith in which every external service sits behind a port, one provider per vendor. Paths are relative to `services/api/`. **For API work this file and `.claude/` take precedence over the documents at the repository root** (an earlier plan): look nowhere else for layout, workflow or commands. This is the company's first product and later ones build on it, so **consistency and maintainability outrank delivery speed**.

> **State on 2026-11-14:** foundation complete, plus the storage and sms integrations (sms: providers `log` and the fake, Msegat pending its documentation), the media module (no endpoints yet) and authentication (`users`, `auth`: phone and OTP sign-in scoped to one audience, the global guard, `pnpm admin:create`). **Production waits on a real SMS provider.** What exists: the registry and ARCHITECTURE.md. Not built: endpoints that grant or disable access, cleanup of expired challenges and tokens, caching, Bull Board, an outbox, other integrations, the reserved names: later steps, not to start unless your task asks. Update this note when a step lands.

## Loaded with this file, and what to read when

Always loaded: the registry index (imported at the end; its area files are not) and `.claude/rules/` `code-structure.md`, `invariants.md`, `database.md`, `modules.md`, `integrations.md`, `testing.md`. A lint message `[Rn]` names its rule in one of them (`code-structure.md`, section 2). Together with the root CLAUDE.md they stay under 50,000 characters (`pnpm instructions:check`): put detail in doc comments or the files below, never repeat a rule.

| Before you… | Read |
|---|---|
| touch an endpoint, a DTO, CORS, rate limits or the HTTP setup | `.claude/rules/http.md`: it loads by itself only once you open a file its `paths:` names, so read it first. |
| add an integration or a provider | the add-integration skill |
| add a module, use case, endpoint, processor or subscriber | the add-module skill |
| need the folder layout, the routes or what exists | `.claude/ARCHITECTURE.md` |
| doubt a settled choice, meet something undecided, make an architectural decision, or design finance or zatca | `.claude/DECISIONS.md` (reasons for every rule; the open business questions) |

**Settled** (stack, storage, Geidea, phone + OTP auth, the five top-level folders, which modules have four layers, the event bus, the routes): DECISIONS.md, "Decisions in force". If you think one is wrong, say so in your report and change nothing.

## Every task that changes code

1. **Find before you build** (`code-structure.md`, section 5): read the registry index, then open the area file (`.claude/registry/<area>.md`) of every area the task touches, before writing anything. Reuse or extend; never copy.
2. **Follow the rules of the area**; read the files above for anything not loaded.
3. **Do what was asked and nothing else.** A refactor, extra feature, new dependency or "while I'm here" fix goes under Suggestions. *Why: a change nobody asked for is a change nobody reviews.*
4. **Do not guess.** Ask when a requirement or a vendor's behaviour is unclear. If told to proceed, put the assumption behind an interface, mark it `ASSUMPTION:` and report it. Never invent credentials, prices, API fields or vendor behaviour.
5. **No commits and no branches unless the user asks in this session.** Leave changes in the working tree.

**Git hooks** (husky; what each runs is commented in `.husky/`): pre-commit runs lint-staged, the registry check and, when an instruction file is staged, the size check; commit-msg runs commitlint. Never pass `--no-verify`: fix what the hook reports. Tests, build, `lint:rules` and `openapi:check` stay in CI: a hook slow enough to be skipped protects nothing.

## Done means

1. The tests `testing.md` requires exist.
2. After your last edit you ran every command below, with zero errors and zero warnings.
3. Recorded: each shared building block added, moved or removed has its line in its registry area file; each architectural decision has its DECISIONS.md entry and is reflected in the rule file it affects; a layout change is in ARCHITECTURE.md. *Why: the next session knows only what is written down.*
4. The always-loaded instructions are still under the limit (`pnpm instructions:check`).
5. The report has: **Changed** (files, and what you searched for first), **Evidence** (each command with its real result, failures quoted), **Not verified** (and why; "nothing" only if true), **Assumptions**, **Suggestions**, **Registry and decisions**.

## Commands (from `services/api/`; CI runs the same list)

| Check | Command |
|---|---|
| Install | `pnpm install`, then `pnpm db:generate` (the Prisma client is generated, not committed) |
| Lint | `pnpm lint` (runs `--fix`: read the diff), `pnpm lint:rules` (proves every rule against `lint-fixtures/`) |
| Types | `pnpm build` (`src/` only), `pnpm test:types` (everything, plus `test/types/`) |
| Tests | `pnpm test` (unit), `pnpm test:e2e` (needs `pnpm infra:up`: PostgreSQL + PostGIS on 5434, Redis on 6380, MinIO on 9002) |
| OpenAPI | `pnpm openapi:generate` after an endpoint or DTO change, `pnpm openapi:check` |
| Registry, instructions | `node .claude/hooks/check-registry.mjs`, `pnpm instructions:check` |
| Database | `pnpm db:migrate`, `pnpm db:deploy`, `pnpm db:generate`, `pnpm db:drift` (migrations against the schema; needs `SHADOW_DATABASE_URL`); `pnpm db:reset` drops data: only when the user asks |
| Run | `pnpm infra:up`, `pnpm start:dev`, then `/v1/health`, `/v1/health/ready`, `/docs` |
| First admin | `pnpm admin:create <phone>` (grants admin access; idempotent) |

Jest prints `ExperimentalWarning: VM Modules`: expected. If a check you need has no command here, report it under "Not verified"; do not invent one.

## Registry

@.claude/REGISTRY.md
