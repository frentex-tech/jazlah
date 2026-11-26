# Registry: Catalog

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **CatalogModule** — `src/modules/catalog/index.ts` — admin lists, cutting and packaging rules, products with their review and change requests, public browsing; exports `PricingService` and the pricing types.
- **PricingService** — `src/modules/catalog/application/pricing.service.ts` — the authoritative price of a product line (`priceLine`, `PRICE_LINE_ERRORS`) for the cart, checkout and occasions; `quoteLines` prices several lines at once with what each shows (`LineQuote`, `QuotedProduct`).
