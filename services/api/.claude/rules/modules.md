# Modules: business domains

Applies to `src/modules/`. Procedure: the add-module skill. Paths are relative to `services/api/`.

> **Blocking for finance and zatca only:** three business questions are open (DECISIONS.md). Do not design what depends on them.

## Shape

- **auth, vendors, catalog, orders, checkout, payments, refunds, wallet, finance** have four layers (auth is the reference, ARCHITECTURE.md). Every other module starts as controllers + service + dto and is promoted when it gains a state machine or money logic: propose the promotion and wait; never half-convert, never hide a state machine in a plain service, never add empty layers.
- **No inventory module**: availability is `catalog`'s, slot capacity `scheduling`'s.
- CRUD modules: `<module>.module.ts`, `<module>.service.ts` (through `DbContext`), `controllers/`, `dto/`.

### Four layers (`api → application → domain ← infrastructure`)

| Layer | Contains | Never |
|---|---|---|
| `api/` | one controller per audience, DTOs, mapping | business rules, Prisma, calls to other modules |
| `application/` | one use case per class, one public method: load through a port, call the domain, save, publish | Prisma, HTTP types, entity rules |
| `domain/` | entities, state machines, rules, ports, events; in-memory fakes of its ports in `domain/fakes/` (excluded from the build) | packages, other layers (R8) |
| `infrastructure/` | Prisma repositories implementing the ports, mappers | business rules; Prisma types never leave it |

- **A state changes only through the state machine that owns it**; others ask through the module's exports. *Why: a stray assignment skips the rules guarding a money-moving transition.*
- **A write to an aggregate locks its root row first**: inside its transaction, through one repository method (`SELECT … FOR UPDATE`; `lockForWrite` in catalog), then reads and decides. *Why: two writers reading the same rows each work out a total or a lowest price without the other's change, and the last write wins.*
- One use case, one class, one file, one unit test; a new operation is a new class, never a method or flag on an existing one. Use cases take ports; their tests use the fakes.
- Only mappers know both shapes. A controller serves one audience. *Why: prefix, guard and permissions differ.*

## Finance: the append-only ledger

Every money movement (payment, commission, payable, refund, COD receivable, transfer) is a ledger entry, never updated or deleted; a correction is a new entry referring to the original. *Why: statements must be reproducible from entries.* Checks: no update or delete in the ledger repository and no other writer; balances derive from entries (a stored total is a cache a test compares); a test proves a correction. Other modules publish what happened; finance records it.

## Other modules

Use only what a module exports from its `index.ts` (R7), never its internals or tables; a missing export is one method on its exported service, registered. To react, subscribe to its event. Never import the realtime gateway: use the publishing port. Event, queue and realtime names are lookup tables: extend them. A module accepting uploads adds its purpose (`<module>.<what>`) to `UPLOAD_PURPOSES` and calls `MediaService`. A processor or subscriber is an entry point that calls a use case or service and holds no rule.

## Events (`EventPublisher`, `@OnDomainEvent`, R16)

1. An event class in the publishing module (`domain/events/<entity>-<action>.event.ts`; CRUD `events/`) extends `DomainEvent<'domain.entity.action'>` with the same `static readonly eventName`, is exported from `index.ts`, and is published with its class: `publish(OrderPlacedEvent, new OrderPlacedEvent(…))`.
2. A past-tense fact (`orders.order.placed`), never a request: to ask, call the service. Payload: ids and routing facts only.
3. Only for effects whose loss is acceptable (notifications, realtime, cache): delivery is in memory. An effect that must happen: the subscriber enqueues a job with `buildJobId`. What must survive a crash between commit and dispatch never uses the bus (ledger in the same transaction; webhooks through an outbox).
4. Publish inside the transaction that makes it true: delivered after the outermost commit, dropped on rollback, at once outside one; publishing never waits for a subscriber.
5. A subscriber is a method in your module's `<name>.subscriber.ts`, `@OnDomainEvent(EventClass)`; it runs on its own and its errors are logged. **Every subscriber is idempotent.** Events published before startup ends reach no one.

## Jobs

0. Register queues with `QueueRegistrationModule.register({ name: QUEUE_NAMES.<key> })` (R15); its `BoundedQueue.add` fails fast with 503 while Redis is down (the job may still land after a timeout: retry only with `buildJobId`).
1. A processor, `<name>.processor.ts` in the owning module, `@Processor(QUEUE_NAMES.<key>)`, extends `JobProcessor` and implements only `handle(job, signal)` (R17, R18). Processors and schedulers are provided with `...provideWorkers(Processor, Scheduler)`, never in `providers` directly (production runs API and worker processes apart).
2. Payloads carry ids, never records.
3. **Every processor is idempotent and safe beside a retry of itself** (a cancelled or lock-expired job may still run): check and effect in one atomic step (conditional update, row lock, `runOnce`), never read then write; pass idempotency keys to vendors. *Why: BullMQ delivers at least once.*
4. Work keyed by one external event or record uses `buildJobId('payment-webhook', provider, eventId)`; it only ignores an add while that id is still kept (its doc comment says how long).
4a. **Exactly-once work** keys itself in the database in its transaction: `transactions.run(() => idempotency.runOnce('payment-webhook', eventId, () => …))`. Repeats get the stored result; a throw leaves no key; external effects go after the commit with the same key.
5. `DEFAULT_JOB_OPTIONS` for every queue; another value is `{ ...DEFAULT_JOB_OPTIONS, <change> }` with a reason. `UnrecoverableError` when retrying cannot help.
6. Long work passes the abort signal on: at shutdown a job still running after 25 s is cancelled and retried.

## What the business needs

One seller per order, who fulfils it. Refunds, partial refunds and weight adjustments are routine first-class operations, never edits to a stored total. Amounts up to whole animals: assume no typical size. Eid al-Adha spikes: say so if a design only fits ordinary volume. Arabic-first: no hard-coded user text. Apply when a choice is open; build nothing unasked.
