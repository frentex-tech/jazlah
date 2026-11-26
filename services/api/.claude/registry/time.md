# Registry: Time

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **RiyadhCalendar** — `src/common/time/riyadh-calendar.ts` — the time helper: the Riyadh day of an instant, minute of day, day arithmetic, weekday, the instant a day starts; `src/common/time/calendar-date.type.ts`, `src/common/time/riyadh-utc-offset.constants.ts` (UTC+3, its ASSUMPTION).
- **Clock** — `src/common/time/clock.port.ts` — `CLOCK` token and `Clock` port; `src/common/time/system-clock.ts` in production, `src/common/time/fixed-clock.fake.ts` in unit tests.
