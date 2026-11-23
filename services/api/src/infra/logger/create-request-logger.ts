import type { Params } from 'nestjs-pino';
import { pinoHttp } from 'pino-http';
import type { HttpLogger } from 'pino-http';

/**
 * The request logger (pino-http) built from the settings of createLoggerParams. It owns
 * the application's one pino instance: nestjs-pino is set up with `useExisting` and logs
 * through a child of it (`LoggerModule`).
 */
export function createRequestLogger(params: Params): HttpLogger {
  const options = params.pinoHttp;
  if (Array.isArray(options)) {
    return pinoHttp(options[0], options[1]);
  }
  return options !== undefined && 'write' in options
    ? pinoHttp(options)
    : pinoHttp(options);
}
