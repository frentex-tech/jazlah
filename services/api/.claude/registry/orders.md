# Registry: Orders and checkout

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **OrdersModule** — `src/modules/orders/index.ts` — orders (four layers): the order tables, `CreateOrderUseCase` (the reusable core: numbering, money, snapshots, first history row, `orders.order.placed`), `FindCustomerOrderUseCase`, `toOrderResponse`, `OrderPlacedEvent`; the state machine and the read routes (ORD-API-2, ORD-API-3) are not built.
- **CreateOrderUseCase** — `src/modules/orders/application/create-order.use-case.ts` — makes an order from a checked `NewOrder` in the caller's transaction; `priceOrder`, `formatOrderNumber` (`JZ-YYMMDD-NNNN`), `initialStatusFor`, `orderTypeOf` are its pure rules in `src/modules/orders/domain/`.
- **OrderRepository** — `src/modules/orders/domain/ports/order.repository.port.ts` — `nextSequence` (atomic per-day counter), `create`, `findOfCustomer`; Prisma on `orders`, `order_items`, `order_status_history` (insert-only), `order_number_counters`; fake `src/modules/orders/domain/fakes/in-memory-order.repository.fake.ts`.
- **CheckoutModule** — `src/modules/checkout/index.ts` — the days, the payment methods and `PlaceOrderUseCase` (`POST /v1/customer/orders`, cash on delivery only: one transaction keyed by `Idempotency-Key` with a body hash).
