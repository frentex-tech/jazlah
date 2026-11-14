# Testing and evidence

Paths are relative to `services/api/`.

## What must have a test

| Code | Test | Covers at least |
|---|---|---|
| use case | unit | success, and each rule or state check that can reject |
| provider error mapping | unit | each vendor error: its code and retryability |
| endpoint | e2e | success, invalid input, authentication, ownership, as they apply |
| `Money` or time helper operation | unit | zero, one halala, rounding, midnight in Riyadh |
| processor, subscriber | unit | calls the right use case; twice with one input applies the effect once |
| finance ledger | unit | a correction leaves the original unchanged; totals equal the entries |

A task that adds one of these without its test is not done; if you cannot write it, say why under "Not verified".

## How tests are written

1. Integrations are replaced by their fake provider; nothing reaches a vendor.
2. Use case unit tests use the in-memory port fakes in the module's `domain/fakes/`: no database, no Nest app.
3. Test the real thing: a test that mocks the class under test, or only asserts a mock was called, proves nothing.
4. Deterministic: no current time, test order, network or sleeping; exact halalas.
5. No real personal data or credentials.
6. Never weaken, skip or delete a failing test to pass; fix the test (and say why it was wrong) or the code.
7. e2e tests use `jazla_test` and the next Redis database (`scripts/e2e.mjs`, which also raises the default rate limit); a test deletes its rows and obliterates its queues.
   - **Queues:** probe queues and processors in `test/support/`, registered beside `AppModule` (`create-queue-probe-app.ts`); wait through worker events (`wait-for-worker-event.ts`). A test that stops Redis (`startTcpProxy`) builds the app with `processors: false` and resumes the proxy before closing: BullMQ 6.7.6 workers were seen to hang in `close()`.
   - **Events:** probes in `test/support/events/`, one publisher and one subscriber module sharing an `EventTrace`; a subscriber writes to the trace before its first await.
   - **HTTP:** `createHttpApp()` (`test/support/create-http-app.ts`) applies `configureHttpApp` like `main.ts`. Vary config with `buildHttpConfig({ ...loadEnv(), … })`; break a dependency with a replacement built from the production class (`new RedisService({ url })`) behind `startTcpProxy`. Rate limit tests clear counters before and after and use their own limits.
   - **Logs:** capture the real logger with `LogCapture` through `LOG_DESTINATION`, and first assert the secret really is in the raw input. One app whose logs are read per test file (nestjs-pino keeps one root logger).
   - **Process behaviour** (exit codes, signals): run a script from `test/support/` as a child process (`test/shutdown.e2e-spec.ts`).
8. Compile-time tests: `test/types/*.type-test.ts`, run by `pnpm test:types`; a line that must not compile carries `// @ts-expect-error -- why`.
9. Lint fixtures (`lint-fixtures/`) are not tests; change them only with `eslint.config.mjs` (`code-structure.md`, 2a).
10. Placement: `<name>.spec.ts` beside the file; `test/<module>.e2e-spec.ts`. No second convention.

## Evidence

After your last edit, run every command in `CLAUDE.md` and report each with its real outcome (counts, every failure's text). A failure you did not cause is still reported, not fixed unasked, with how you know it predates you. What you could not run goes under "Not verified" with what it would need. A reported failure is a correct result; a hidden one is not.
