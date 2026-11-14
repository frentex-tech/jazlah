# Integrations: external services behind ports

Applies to `src/integrations/` (capabilities: mail, sms, push, payments, storage, delivery, zatca, bnpl). Procedure: the add-integration skill. Paths are relative to `services/api/`.

## Shape (every capability)

`<capability>.port.ts` (interface and token, in our terms: no vendor fields or SDK types), `.types.ts` (port arguments and results), `.errors.ts` (built on `AppError`), `.service.ts` (provider selection and fallback where it applies), `.module.ts` (selects providers from config; the only file naming provider classes), `index.ts` (the public entry: module, service, port and token, types, errors), `testing.ts` (the test-only entry: the fake and test helpers, R22), `providers/<vendor>.provider.ts` (one per vendor: translates types and errors), `providers/fake.provider.ts` (in memory, deterministic, records calls, can be told to fail). The word is **provider**, never adapter. Mirror the reference integration in the registry exactly.

## Rules

1. A new vendor is one provider file, its test, one registration and one config value. Needing any other edit means the shape is broken: stop and report.
2. Modules import an integration only through `index.ts` (R6), tests also through `testing.ts` (R22); an integration imports no module and no other integration (R4).
3. Each provider maps every documented vendor error to an `AppError` code, marked retryable or not, each with a unit test.
4. Vendor facts come from vendor documentation; never invented. Missing or silent docs: ask; if told to proceed, isolate the unknown in the provider, mark it `ASSUMPTION:` and report it.
5. Credentials and endpoints come from typed config, never literals.
6. Tests use the fake provider; no test calls a vendor or sandbox.
7. Logs carry our ids and the mapped code only: no payloads, tokens or OTP codes; phone numbers and addresses masked.

## Mail, SMS, push: ordered fallback

The config gives an ordered provider list; the service moves to the next provider **only on a retryable failure** (an undocumented vendor error counts as retryable; map and test it). Providers make one attempt and know nothing of fallback. Fallback lives in one place: before writing it for a second capability, find the first (registry); if it is inline in another service, ask rather than copy or refactor. Service tests against the fake: first succeeds; first fails retryably, second succeeds; first fails non-retryably, second never called; undocumented error, second tried; all fail.

## Payments, delivery, bnpl: no failover, no blind retry

- One active provider takes new payments (Geidea), shipments or credits; the record stores the provider that took it, and every later call (capture, void, refund, cancel, status) resolves the provider **from the record**. *Why: only the provider holding the money or shipment can act on it.*
- A failure is never sent to another provider by code.
- An unknown or ambiguous response to a creating call (timeout, connection lost after sending, unknown status) marks it pending and asks the same provider for the status; the request is never repeated blindly. *Why: the first may have succeeded.*
- Required tests: the active provider changes after creation and a later call still reaches the original; a charge timeout leaves the payment pending, triggers a status query and makes no second charge.

## Zatca: queued, idempotent, one provider

Never submitted inline: through a queue (name in `QUEUE_NAMES`, registered by the invoicing module, processor there), retried against the same provider, each submission keyed by the invoice (`buildJobId`, and an idempotency key so a retry cannot create a second invoice). Required test: the same submission processed twice reaches the provider's create path once.

## Storage

S3-compatible, one provider, only through the storage port; no vendor named outside the provider file. Uploads are presigned POSTs (the policy limits size and type at the storage), downloads presigned GETs or public URLs: the API never streams file contents. Modules upload through `MediaService` (`modules.md`), not the port.

## Fakes in other modules' tests

Tests import the fake from the integration's `testing.ts` (`@integrations/<capability>/testing`), never from `index.ts`, which exports nothing test-only. Lint (R22) refuses `testing.ts` outside `*.spec.ts` and `test/`, so production code cannot reach a fake.
