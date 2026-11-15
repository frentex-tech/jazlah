# Registry: Events

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **Domain events** — `src/common/events/` — `DomainEvent` and its types, plain TypeScript. [whole folder: the base class and its types]
- **Event bus** — `src/infra/event-bus/` — `EventPublisher.publish(EventClass, event)`, `@OnDomainEvent`. [whole folder: the event-emitter wrapper (R16)]
