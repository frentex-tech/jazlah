# Registry: Scheduling

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **SchedulingModule** — `src/modules/scheduling/index.ts` — the scheduling engine and vendor capacity; exports `SchedulingService`, `CapacityService`, `DAY_UNAVAILABLE_REASONS` and the types `AvailableDaysRequest`, `CapacityRequest`, `CheckoutDay`, `PickupTerms`, `SchedulingOrderType`.
- **SchedulingService** — `src/modules/scheduling/scheduling.service.ts` — the frozen interface: `availableDays(request)`, `assertDayAvailable(request, date)` (DAY_FULL, DAY_NOT_AVAILABLE), `pickupTerms(vendorId)`; for the cart, checkout and orders.
- **CapacityService** — `src/modules/scheduling/capacity.service.ts` — `reserve` and `release` a place on a vendor's day inside the order's transaction (atomic conditional update, DAY_FULL), `bookingsOf`.
