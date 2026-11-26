# Registry: Cart

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **CartModule** — `src/modules/cart/index.ts` — the server cart (four layers): one store, lines priced by the catalog, totals with VAT; the fulfilment (delivery or pickup and the day, SCH-API-2); exports `GetCartUseCase` and the `PricedCart` types (checkout reads the cart through them).
- **LockCartForCheckoutUseCase**, **ClearCartUseCase** — `src/modules/cart/application/lock-cart-for-checkout.use-case.ts` — exported for placing an order: the cart row locked and priced now (inside the transaction); `ClearCartUseCase` empties it.
