---
name: add-integration
description: Add an external-service integration to the JAZLA API (mail, sms, push, payments, storage, delivery, zatca, bnpl, or a new capability), or add a provider (a vendor) to an existing one. Use for any task that mentions a provider, vendor or gateway, or sending email, SMS, OTP messages or push notifications, taking payments, storing files, shipping with a delivery company, or e-invoicing.
---

# Add an integration, or add a provider to one

Paths are relative to `services/api/`. Rules: `.claude/rules/integrations.md`. Layout: `.claude/ARCHITECTURE.md`.

Work through the steps in order. Do not write a file before step 5.

## 1. Find what exists

1. Read `.claude/REGISTRY.md`: the "integrations" section and the "Reference implementations" table.
2. List `src/integrations/`. The registry can be stale, and the folder cannot.
3. Decide which case you are in:
   - **The capability exists** (for example `src/integrations/sms/` is there): you are adding a provider. Go to step 2, then follow "Adding a provider" in step 5.
   - **The capability does not exist:** you are adding a capability. Continue.

## 2. Read the reference before designing anything

Open every file of the reference integration the registry names. Note its file names, how the module picks providers from configuration, how the service does fallback, how the fake is built and how the tests are laid out. Yours will match it file for file.

If no integration exists yet, yours is the reference: follow `.claude/ARCHITECTURE.md` and the rule file exactly, and say in your report that later integrations will copy this one.

## 3. Collect the vendor facts

For each vendor you need its documentation: authentication, endpoints, request and response fields, error codes, limits. Ask the user for the documentation or a link if the task did not include it. Which vendors implement mail, sms and push is not decided (`.claude/DECISIONS.md`): ask.

- Never write an endpoint, field name or error code from memory of how such services usually work.
- Never invent credentials. Config keys get placeholder values in `.env.example`.
- If the user tells you to proceed without documentation: build the port, types, errors, service, module, `index.ts` and fake, leave the vendor's provider out or mark every unknown in it with an `ASSUMPTION:` comment, and list each one in your report.

## 4. Design the port in our terms

- The port says what the business needs ("send this text to this phone number"), not what a vendor offers. No vendor names, field names or SDK types in the port, the types file or the errors file.
- Keep it as small as the task needs. A method that a vendor cannot implement means the port is too wide.
- Reuse existing shared types and error codes (registry, `src/common/errors/`) before declaring new ones.

## 5. Write the files, one thing per file

**Adding a capability.** This is the whole set:

| File | Content |
|---|---|
| `src/integrations/<capability>/<capability>.port.ts` | the interface and its injection token |
| `src/integrations/<capability>/<capability>.types.ts` | the port's argument and result types |
| `src/integrations/<capability>/<capability>.errors.ts` | the errors the capability raises, built on `AppError` |
| `src/integrations/<capability>/<capability>.service.ts` | what the rest of the API calls; provider selection and, where it applies, fallback |
| `src/integrations/<capability>/<capability>.module.ts` | selects providers from configuration |
| `src/integrations/<capability>/index.ts` | the public entry: re-exports only, nothing test-only |
| `src/integrations/<capability>/testing.ts` | the test-only entry: re-exports the fake and any test helpers (R22) |
| `src/integrations/<capability>/providers/<vendor>.provider.ts` | one file per vendor |
| `src/integrations/<capability>/providers/fake.provider.ts` | the fake for tests |
| a `.spec.ts` beside the service and beside each provider | see step 7 |

**Adding a provider** to an existing capability: one provider file, its `.spec.ts`, one registration in the capability's module, one config value. If you find yourself editing the port, the service or any file under `src/modules/`, stop and tell the user: either the port is missing something (a decision for them) or the provider is doing too much.

## 6. Configuration

- Add the new variables (provider selection or order, credentials, endpoints) to the environment schema in `src/config/`, typed and validated.
- Add them to `.env.example` with placeholder values.
- The module reads typed config. No `process.env` in an integration.

## 7. Tests

- **Each provider:** one unit test per mapped vendor error (the `AppError` code it becomes, retryable or not), plus the success path. The HTTP layer is stubbed; no test calls the vendor.
- **The service, against the fake:**
  - **mail, sms, push:** first provider succeeds; first fails retryably and the second succeeds; first fails non-retryably and the second is never called; first fails with an undocumented error, which counts as retryable, and the second is tried; every provider fails.
  - **payments:** a new payment goes to the active provider; capture, void and refund go to the provider stored on the payment record, including after the active provider has changed; a timeout or an unrecognised gateway response leaves the payment pending, triggers a status query and sends no second charge. There is no fallback to test, and none to write.
  - **delivery, bnpl:** like payments. A later call for a shipment or transaction goes to the provider stored on its record, including after the active provider has changed; nothing fails over automatically; an unknown response to a create call leads to a status check with the same provider, not a second create.
  - **zatca:** no fallback. A submission is queued, retried against the same provider, and carries an idempotency key: processing the same submission twice creates one invoice.
  - **storage:** one provider, no fallback. Test the provider and the fake.
- **The fake itself** needs no vendor behaviour. It records calls and fails on request.
- **Tests import the fake from `testing.ts`** (`@integrations/<capability>/testing`), never from `index.ts` or `providers/`.

## 8. Check the boundaries

Run `pnpm lint`: R4 (an integration imports no module and no other integration), R6 (outside code imports an integration only through its `index.ts`, never `providers/`) and R22 (`testing.ts` only from `*.spec.ts` and `test/`) are enforced there (`.claude/rules/code-structure.md`, section 2). Then run this search, which lint does not cover, and fix any hit:

- `Grep` for the vendor's name outside `src/integrations/<capability>/providers/`, the capability's module file and `src/config/`: the vendor must not be known anywhere else.

## 9. Verify

Run lint, typecheck or build, unit tests and e2e tests with the commands in `CLAUDE.md`, after your last edit. Keep the real output.

## 10. Record it

1. Add or update the line in `.claude/REGISTRY.md` under "integrations": the folder, what it does, the providers that exist, the config key that selects them, whether it falls back, and the fake its `testing.ts` exports.
2. If this is the first integration of its kind, fill in the "Reference implementations" table.
3. If you decided anything a later integration should repeat, add a line to the log in `.claude/DECISIONS.md`.
4. Run `node .claude/hooks/check-registry.mjs`.

## 11. Report

Use the report format in `CLAUDE.md`. For an integration, also state: which reference you copied, where each vendor fact came from, and every `ASSUMPTION:` you left in the code.
