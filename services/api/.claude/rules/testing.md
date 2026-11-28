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
2. Use case unit tests use the module's `domain/fakes/`: no database, no Nest app.
3. Test the real thing: a test that mocks the class under test, or only asserts a mock was called, proves nothing.
4. Deterministic: no current time, test order, network or sleeping; exact halalas.
5. No real personal data or credentials.
6. Never weaken, skip or delete a failing test to pass; fix the test (and say why it was wrong) or the code.
7. e2e: `scripts/e2e.mjs` gives the run `jazla_test`, the next Redis database, a raised default rate limit and its own REDIS_KEY_PREFIX. A test deletes its rows and obliterates its queues. Suites run in parallel except `cart.e2e-spec.ts`, `operations-settings.e2e-spec.ts` and `place-order.e2e-spec.ts`, which write the singleton operations settings row; `scripts/e2e.mjs` runs those three serially after the parallel suites. Add any new settings-writing suite to that phase. Name other shared state (rows, queues, object keys, counters) per suite or run; never clear counters by pattern. Helpers in `test/support/`, each documented there:
   - **HTTP:** `createHttpApp()` (as `main.ts`; vary config with `buildHttpConfig`; each test its own `testClientAddress`); break a dependency with the production class behind `startTcpProxy`.
   - **Queues:** no worker by default; a suite turns on what it needs with `workers: [...]`; probes beside `AppModule`; wait through worker events. A test that stops Redis turns on no worker and resumes the proxy before closing (BullMQ workers hang in `close()`).
   - **Events:** probes in `test/support/events/` sharing an `EventTrace`; a subscriber writes to it before its first await.
   - **Logs:** `LogCapture` through `LOG_DESTINATION`; first assert the secret is in the raw input; one app whose logs are read per test file.
   - **Process behaviour** (exit codes, signals): a child process from `test/support/`.
8. Compile-time tests: `test/types/*.type-test.ts` (`pnpm test:types`); a line that must not compile carries `// @ts-expect-error -- why`.
9. Lint fixtures (`lint-fixtures/`) are not tests; change them only with `eslint.config.mjs`.
10. Placement: `<name>.spec.ts` beside the file; `test/<module>.e2e-spec.ts`. No second convention.

## Evidence

As `CLAUDE.md`, "Done means", with counts and every failure's text. A failure you did not cause is still reported, not fixed unasked, with how you know it predates you. A reported failure is a correct result; a hidden one is not.
