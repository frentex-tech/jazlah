/** The entity of the audit rows the log probe writes; the test deletes them by it. */
export const LOG_PROBE_ENTITY = 'e2e-log-probe';

/** An obviously fake Saudi mobile number, written into the rows that fail. */
export const LOG_PROBE_PHONE = '+966500000123';

/**
 * The property name of the plain object `GET /v1/log-probe/thrown-value` throws (not an
 * Error). Its value holds the probe phone, which must not be logged.
 */
export const LOG_PROBE_THROWN_KEY = 'e2eThrownMarker5c1d';

/** The message of the error `GET /v1/log-probe/after-headers` throws. */
export const LOG_PROBE_AFTER_HEADERS_MESSAGE = 'e2e failure after headers 9b2e';
