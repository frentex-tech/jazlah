// lint-rule: support
/** Stand-in for the real DomainEvent in src/common/events: plain TypeScript, no package. */
export abstract class DomainEvent<Name extends string = string> {
  declare private readonly eventNameBrand: Name;
}
