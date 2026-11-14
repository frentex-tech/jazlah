/**
 * Some endpoints are neither under an audience prefix nor marked `@Public()`
 * (RouteAudienceCheck). Thrown while the application starts, so it does not start.
 */
export class RouteWithoutAudienceError extends Error {
  constructor(readonly endpoints: readonly string[]) {
    super(
      `These endpoints have no audience: ${endpoints.join(', ')}. Put the controller under public/, customer/, vendor/, kitchen/ or admin/, or mark it @Public().`,
    );
    this.name = 'RouteWithoutAudienceError';
  }
}
