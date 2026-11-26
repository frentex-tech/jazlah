# Registry: Settings

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **SettingsModule** — `src/modules/settings/index.ts` — the operations settings (one row, admins edit, audited); exports `OperationsSettingsService` and the types `OperationsSettings`, `CutoffRule`, `Cutoffs`, `ClosedDay`, `OrderingPause`, `TimeWindow`, `DailyCapacity`.
- **OperationsSettingsService** — `src/modules/settings/operations-settings.service.ts` — `current()` (no cache: a change counts from the next request), `update(changes, actorId)`, `setPause(pause, actorId)`; for the cart, scheduling and checkout.
