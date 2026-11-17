# Registry: Customers

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **CustomersModule** — `src/modules/customers/index.ts` — a customer's profile, marketing consent and saved addresses (CRUD-shaped, one service per sub-resource; every write locks the user's row first).
- **CustomerProfilesService** — `src/modules/customers/customer-profiles.service.ts` — `profileOf` (defaults when none saved; `isComplete`), `update`, `eraseOf`; types `CustomerProfile`, `PreferredLanguage`, `PREFERRED_LANGUAGES` from the index.
- **MarketingConsentsService** — `src/modules/customers/marketing-consents.service.ts` — the insert-only consent history: `currentOf`, `set`, `withdrawForDeletion`; `MarketingConsentResponseDto` from the index.
- **CustomerAddressesService** — `src/modules/customers/customer-addresses.service.ts` — at most ten addresses, one default: `list`, `get`, `create`, `update`, `makeDefault`, `remove`, `eraseOf` (orders will read them).
