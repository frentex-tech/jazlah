# Invariants: money, time, errors, type safety, secrets

These hold in every file. Paths are relative to `services/api/`. Each names a shared building block: find it in the registry; if it is not built, create it once, in its reserved place, with tests, only when your task needs it.

## Money (integer halalas; prices include 15% VAT)

1. Every amount is an integer number of halalas: database, DTOs, entities, events, and what goes to a gateway (converted inside the provider if the gateway wants another unit).
2. All arithmetic on amounts goes through `Money` (`src/common/money/`): sums, quantities, weights, percentages, splits, rounding. Check: outside `Money`, no `/ 100`, `* 100`, `toFixed`, `parseFloat`, `Math.round/floor/ceil` on an amount, and no decimal type. If `Money` lacks an operation, add it there with tests. *Why: floats lose halalas and two roundings disagree; partial refunds and weight adjustments are routine, so parts must add up exactly.*
3. Formatting for display is the clients' job: the API sends integer halalas; `Money` is not shared with the frontends.
4. Money that moved is a finance ledger entry, and the ledger is append-only (`modules.md`, "Finance").

## Time

Timestamps are stored and sent in UTC. Business-calendar logic (today, a slot's day, cut-offs, Eid) uses `Asia/Riyadh` through the time helper. Check: no `getHours`, `getDate`, `getDay`, `setHours`, `toLocaleString` on a `Date` in business code, nothing that depends on the server's timezone. *Why: 01:30 in Riyadh is still yesterday in UTC.*

## Errors

1. Throw `AppError` (`src/common/errors/`) with a stable UPPER_SNAKE_CASE code; never a bare `Error` or an ad-hoc class for something a client sees. The global filter writes `{ code, message, details?, requestId }` with the message from the catalogue, localized: never build an error body. A new code goes in `error-code.enum.ts` with its Arabic and English message and its default status. Request validation is the global pipe: write a DTO, never validate by hand.
2. A code is a public contract: never rename or reuse one, never distinguish two situations by message text; search the list before adding.
3. Never swallow an error: a `catch` handles the failure completely or rethrows it mapped to `AppError`. An empty or log-only catch hides failures in a system that moves money.
4. Vendor errors are mapped inside the provider (`integrations.md`).

## Type safety (lint)

| Id | Rule |
|---|---|
| R9 | No `any`, and nothing unsafe done with one (`no-explicit-any`, `no-unsafe-assignment`, `-member-access`, `-call`, `-return`, `-argument`). Type a library's `any` as `unknown`, then narrow or validate. |
| R10 | No `@ts-ignore` or `@ts-nocheck`, with or without a reason; `@ts-expect-error` only with a description (`-- why`). *Why: they switch the compiler off where it reported a problem.* |
| R11 | Only `src/config/load-env.ts` reads `process.env`: not directly, destructured, imported from `process`/`node:process`, or through `globalThis`. Inject a typed config namespace. |
| R12 | A disable comment covers one line (`eslint-disable-next-line` or `-line`; no block or file disable, no `eslint-enable`), names its rules, says why (`-- reason`), is used, and never names a boundary rule, an R9 or R10 rule, or a rule carrying R11 or R14 to R21. *Why: `/* eslint-disable -- reason */` once turned off every rule in a file.* |
| R13 | No floating promises (await, return, or `void` on purpose); no `console` in `src/` (the application logger). |
| R21 | No type assertion from `any` or `unknown` to a concrete type (`JSON.parse(x) as Order`, `x as unknown as Order`), in `src/` outside unit tests. A value from outside the program (request bodies, vendor responses, queue payloads, environment) is validated (zod, a class-validator DTO) or narrowed with a type guard at the boundary. `as const` and asserting to `unknown` are allowed; a unit test's partial test double is exempt. |

## Secrets and personal data

1. Secrets never enter the repository (source, tests, fixtures, seeds, examples; `.env.example` holds placeholders) or the logs (tokens, OTP codes, authorization headers, gateway credentials, whole bodies). Never invent a credential, even a realistic placeholder.
2. Phone numbers and addresses are masked in logs with the masking helper; log our own ids instead. *Why: logs travel further and live longer than the database.*
3. Do not open real `.env` files; read `.env.example` and `src/config/`.
4. The logger keeps only an error's name, message, code, stack and cause, drops query strings, allowlists headers and redacts secret-like fields (`src/infra/logger/`): a safety net, not permission.
