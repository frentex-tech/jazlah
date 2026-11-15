# Integrations: external services behind ports

Applies to `src/integrations/` (mail, sms, push, payments, storage, delivery, zatca, bnpl). Procedure and file list: the add-integration skill. Paths are relative to `services/api/`.

## Shape

Each capability has the files of the reference integration (ARCHITECTURE.md), exactly: port (interface and token in our terms, no vendor fields or SDK types), types, errors (on `AppError`), service (selection and fallback where it applies), module (the only file naming provider classes; selects them from config), `index.ts` (public entry), `testing.ts` (test-only entry, R22), `providers/<vendor>.provider.ts` (translates types and errors), `providers/fake.provider.ts` (in memory, deterministic, records calls, fails on request). The word is **provider**, never adapter.

## Rules

1. A new vendor is one provider file, its test, one registration and one config value. Needing any other edit means the shape is broken: stop and report.
2. Modules import an integration only through `index.ts` (R6), tests also `testing.ts` (R22); an integration imports no module and no other integration (R4).
3. Each provider maps every documented vendor error to an `AppError` code, retryable or not, each with a unit test.
4. Vendor facts come from vendor documentation, never invented. Missing or silent docs: ask; if told to proceed, isolate the unknown in the provider, mark it `ASSUMPTION:` and report it.
5. Credentials and endpoints come from typed config, never literals.
6. Tests use the fake provider (from `@integrations/<capability>/testing`, never `index.ts`); no test calls a vendor or sandbox.
7. Logs carry our ids and the mapped code only: no payloads, tokens or OTP codes; phones and addresses masked.

## Mail, SMS, push: ordered fallback

The config gives an ordered provider list; the service moves on **only on a retryable failure** (an undocumented vendor error counts as retryable; map and test it). Providers make one attempt and know nothing of fallback, which lives in one place: before writing it for a second capability, find the first (registry); if it is inline in another service, ask rather than copy or refactor. Service tests against the fake: the five cases of the skill.

## Payments, delivery, bnpl: no failover, no blind retry

- One active provider takes new payments (Geidea), shipments or credits; the record stores the provider that took it, and every later call (capture, void, refund, cancel, status) resolves the provider **from the record**. *Why: only the provider holding the money or shipment can act on it.*
- A failure is never sent to another provider by code.
- An unknown or ambiguous response to a creating call (timeout, connection lost after sending, unknown status) marks it pending and asks the same provider for the status; never repeated blindly. *Why: the first may have succeeded.*
- Required tests: a later call reaches the original provider after the active one changed; a charge timeout leaves the payment pending, queries the status, makes no second charge.

## Zatca: queued, idempotent, one provider

Never submitted inline: a queue (name in `QUEUE_NAMES`, registered and processed by the invoicing module), retried against the same provider, each submission keyed by the invoice (`buildJobId`, plus an idempotency key so a retry cannot create a second invoice). Required test: the same submission processed twice reaches the provider's create path once.

## Storage

S3-compatible, one provider, only through the port; no vendor named outside the provider file. Uploads are presigned POSTs (the policy limits size and type), downloads presigned GETs or public URLs: the API never streams file contents. Modules use `MediaService` (`modules.md`), not the port.
