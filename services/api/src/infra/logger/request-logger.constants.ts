/**
 * Injection token of the request logger: the pino-http middleware (`HttpLogger`) that
 * gives each request its id and writes its log line. `configureHttpApp` mounts it first,
 * ahead of the rate limit and the body parser, so every request is logged, also one
 * refused before routing.
 */
export const REQUEST_LOGGER = Symbol('REQUEST_LOGGER');
