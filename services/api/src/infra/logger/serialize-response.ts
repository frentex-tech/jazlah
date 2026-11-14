import { LOGGED_RESPONSE_HEADERS } from './logged-headers.constants';
import { pickHeaders } from './pick-headers';

/**
 * The response as it appears in a request log line: the status and the allowed headers
 * (LOGGED_RESPONSE_HEADERS). pino-http passes pino's standard response object.
 */
export function serializeResponse(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  return {
    statusCode: Reflect.get(value, 'statusCode'),
    headers: pickHeaders(
      Reflect.get(value, 'headers'),
      LOGGED_RESPONSE_HEADERS,
    ),
  };
}
