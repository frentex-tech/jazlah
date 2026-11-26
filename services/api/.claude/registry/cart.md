# Registry: Cart

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **CartModule** — `src/modules/cart/index.ts` — the server cart (four layers): one store, lines priced by the catalog, totals with VAT; exports nothing else yet (checkout reads it in ORD-API-1).
