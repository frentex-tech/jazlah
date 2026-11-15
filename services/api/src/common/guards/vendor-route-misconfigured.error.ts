/**
 * The vendor routes cannot be protected by the organisation status guard
 * (VendorRouteCheck): some are marked `@Public()`, or no VendorStatusChecker is bound.
 * Thrown while the application starts, so it does not start.
 */
export class VendorRouteMisconfiguredError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(
      `The vendor routes cannot be checked for suspended vendors: ${problems.join('; ')}.`,
    );
    this.name = 'VendorRouteMisconfiguredError';
  }
}
