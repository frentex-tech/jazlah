# lint-fixtures

Files that prove the lint rules in `eslint.config.mjs`. They are not application code and not tests: build, Jest and `pnpm lint` all skip this folder. `pnpm lint:rules` (`scripts/check-lint-rules.mjs`) lints them with the real config.

`src/` mirrors the API's layout: a fake `sms` integration with `providers/` and a `testing.ts` (for R22, with a `.spec.ts` fixture as the test that may import it), a second integration `mail`, a `catalog` module (controllers + service shape), an `orders` module with `api/`, `application/`, `domain/` and `infrastructure/`, a stand-in for the generated Prisma client in `infra/database/generated/` (for R14), a stand-in `QueueRegistrationModule` in `infra/queue/` (for R15), a stand-in `EventPublisher` in `infra/event-bus/` (for R16), a stand-in rate limit decorator in `infra/rate-limit/` (for R19), loose files in `modules/`, `integrations/` and `scripts/` (for R0), and `../outside/`, a local file outside every element (for R0's default). `tsconfig.json` here maps the `@…/*` aliases into this folder.

The first line of every file states what it proves:

- `// lint-rule: R6 violates`: the file must report problems, all of them from rule R6.
- `// lint-rule: R5 R6 R7 conforms`: the file must report nothing; it counts as the conforming case of each rule named.
- `// lint-rule: support`: the file must report nothing; it exists so other fixtures can import it.

Every rule id in `scripts/check-lint-rules.mjs` needs at least one violating and one conforming file. Change these files only together with the rule they prove: `.claude/rules/code-structure.md`, section 2a.
