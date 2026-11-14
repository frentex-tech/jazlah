# ADR-0007: Backend architecture — structure, integrations, money and events

- **Status:** accepted
- **Date:** 2026-11-13

## Context
ADR-0001 and ADR-0002 fixed the stack and the core libraries before any backend code existed. Planning the API in detail raised questions they did not answer: how modules are layered, how integrations are shaped and what happens when a vendor fails, where money arithmetic and the money ledger live, and how modules react to each other without importing each other. The payment gateway was also still open. The backend owner decided these on 2026-11-13.

The product is the multi-vendor platform in `docs/requirements.md`: JAZLA's own products plus partner merchants, contracted kitchens, per-merchant commission, weekly transfers, and cash on delivery collected by the delivery company.

Numbers 0003 to 0006 are reserved by planned tasks (hosting, payment gateway review, delivery integration, ZATCA), so this record is 0007.

## Decision

**Structure of `services/api`** (layout in `docs/architecture.md` §3)

| Concern | Choice | Why |
|---|---|---|
| Top-level folders | `src/config`, `src/common`, `src/infra`, `src/integrations`, `src/modules` | Code that later products reuse (`common`, `infra`, `integrations`) stays apart from business code |
| Internal infrastructure | `src/infra/`: database, jobs, realtime, redis, logger, health, and the in-process event bus | One place for the infrastructure we run ourselves |
| Modules with money or state | Four layers (`api/`, `application/` with one class per use case, `domain/`, `infrastructure/`) for orders, checkout, payments, refunds, wallet, finance | The rules can be tested without the framework or the database |
| Every other module | Controllers + service + dto. Promoted to four layers when it gains a state machine or money logic | No empty layers |
| Controllers | One per audience (customer, vendor, kitchen, admin) | Keeps the route prefixes, guards and permissions of each audience apart |
| Order status | Changes only in the state machine in the orders domain layer | One guarded place for every transition |
| Inventory | No inventory module. Product availability belongs to catalog, slot capacity to scheduling | Neither needs a module of its own yet |
| Dependency rules | Enforced by ESLint. Modules never import a provider; `integrations` and `infra` never import from `modules`; `common` imports from none of them; a module uses another only through its exports; `domain/` has no NestJS or Prisma imports | Boundaries that are only documented do not hold |

**Events, jobs and realtime**

| Concern | Choice | Why |
|---|---|---|
| Module-to-module reactions | An in-process event bus. The bus lives in `infra`; publishers and subscribers live in modules | Notifications, realtime updates and jobs react to orders with no import from `infra` into `modules` |
| Jobs | `src/infra/jobs/` holds queue registration and the connection only. A processor that runs business logic lives in the module that owns the logic | Same reason |
| Realtime | `src/infra/realtime/` holds the socket gateway, the room conventions and a publishing port. Modules publish through the port and never import the gateway | Same reason |

**Integrations** (`src/integrations/<capability>/`: port, types, errors, service, module, `index.ts`, `providers/<vendor>.provider.ts`, `providers/fake.provider.ts`)

| Capability | Behaviour when a provider fails | Why |
|---|---|---|
| mail, sms, push | Ordered provider list; fall back on a retryable failure. An undocumented vendor error counts as retryable | A message that is not sent costs more than a second attempt elsewhere |
| payments | Never fails over. One active provider takes new payments; each payment record stores its provider; capture, void and refund go to that provider. An unknown or ambiguous response marks the payment pending and triggers a status query | A blind retry can charge the customer twice |
| delivery, bnpl | Like payments: the provider is recorded on the shipment or transaction and every later call goes to it. No automatic failover | Only the provider that holds the shipment or the credit can act on it |
| zatca | No fallback. Submissions go through a queue and retry against the same provider with an idempotency key | An invoice must never be submitted twice |
| storage | One provider, no fallback | Files live in one place |

The capabilities are mail, sms, push, payments, storage, delivery, zatca and bnpl. The word for a vendor implementation is "provider".

**Money**

| Concern | Choice | Why |
|---|---|---|
| Money helper | `src/common/money/` in the API. All arithmetic on halala amounts goes through it. Frontends receive integer halalas through the generated `packages/api-client`. No new shared package | One place rounds; clients never compute authoritative amounts |
| Finance ledger | Append-only. Every movement of money (customer payment, commission, merchant payable, refund, COD receivable from the delivery company, transfer) is a ledger entry. Entries are never updated or deleted; a correction is a new entry | Statements and settlements must be reproducible from the entries alone |
| Errors | `AppError` and the error code list in `src/common/errors/`. Codes are UPPER_SNAKE_CASE. `any` and `@ts-ignore` are never allowed | Clients branch on stable codes |

**Platform**

| Concern | Choice | Why |
|---|---|---|
| Database | PostgreSQL 17 with PostGIS. Local image `postgis/postgis:17-3.5` | Version pinned across local, CI and hosted environments |
| Prisma schema | Multi-file, one schema file per domain | Each domain owns the file that holds its models |
| Object storage | S3-compatible, through the storage port, no vendor named | Hosting is not chosen yet (ADR-0003) |
| Payment gateway | Geidea, behind the payments port | The backend owner's selection |

## Consequences
- **Supersedes in ADR-0001:** the phrase "every external provider sits behind an adapter interface". Providers sit behind a port in the shape above, and the word is "provider". "PostgreSQL + PostGIS" is now pinned to PostgreSQL 17. The rest of ADR-0001 stands.
- **Supersedes in ADR-0002:** in the ORM row, the path `database/geo.ts` is now `src/infra/database/geo.ts`, and the single schema file is now a multi-file schema. The rest of ADR-0002 stands, including pnpm + Turborepo, BullMQ, socket.io and the generated API clients.
- `FR-PAY-01` in `docs/requirements.md` records the Geidea selection. The published SRS v1.0 (PDF and HTML) predates it and still lists four candidate gateways.
- Three business questions stay open and block the finance and ZATCA design only: who is the seller of record on a partner merchant's order; whether kitchens are paid through the platform; and whether Geidea supports settlement to sub-merchants, and if not, how merchant transfers are executed.
- The working rules that follow from this record, and the index of shared backend code, are in `services/api/CLAUDE.md` and `services/api/.claude/`.
- Changing any of these choices needs a new ADR.
