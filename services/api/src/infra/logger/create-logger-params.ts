import type { DestinationStream } from 'pino';
import type { Params } from 'nestjs-pino';
import type { AppConfig } from '@config/app-config.type';
import type { LoggerConfig } from '@config/logger-config.type';
import { REQUEST_ID_HEADER } from '@common/request-id/request-id.constants';
import { resolveRequestId } from '@common/request-id/resolve-request-id';
import { isModuleResolvable } from './is-module-resolvable';
import { redactSensitiveFields } from './redact-sensitive-fields';
import { serializeError } from './serialize-error';
import { serializeRequest } from './serialize-request';
import { serializeResponse } from './serialize-response';

/**
 * Builds the nestjs-pino settings, which apply to every log line of the application:
 * request lines, Nest's Logger, and everything that logs through them (Redis, BullMQ,
 * readiness, jobs).
 *
 * - Each request gets an id (the incoming `x-request-id` when safe, else a new one),
 *   returned in the `x-request-id` response header and bound to every log line.
 * - Errors (`err`) keep only name, message, code, stack and cause (`serializeError`).
 * - Requests are logged with the path only (no query string), `req.ip` and allowlisted
 *   headers; responses with the status and allowlisted headers.
 * - Secret-like fields are redacted at any depth, case-insensitively
 *   (`redactSensitiveFields`).
 * - Readable lines in development when pino-pretty is installed, JSON otherwise
 *   (production, or development without dev dependencies), silent in test unless a test
 *   passes a destination to capture the lines.
 * - A request that ends in 4xx is logged at warn, 5xx at error with the error's stack.
 */
export function createLoggerParams(
  app: AppConfig,
  logger: LoggerConfig,
  canUsePretty: () => boolean = () => isModuleResolvable('pino-pretty'),
  destination?: DestinationStream,
): Params {
  const pretty =
    destination === undefined &&
    app.nodeEnv === 'development' &&
    canUsePretty();
  const options = {
    level:
      app.nodeEnv === 'test' && destination === undefined
        ? 'silent'
        : logger.level,
    serializers: {
      err: serializeError,
      req: serializeRequest,
      res: serializeResponse,
    },
    formatters: { log: redactSensitiveFields },
    genReqId: (
      req: { headers: Record<string, string | string[] | undefined> },
      res: { setHeader: (name: string, value: string) => unknown },
    ) => {
      const id = resolveRequestId(req.headers[REQUEST_ID_HEADER]);
      res.setHeader(REQUEST_ID_HEADER, id);
      return id;
    },
    customLogLevel: (
      _req: unknown,
      res: { statusCode: number },
      error?: Error,
    ) => {
      if (error || res.statusCode >= 500) {
        return 'error' as const;
      }
      return res.statusCode >= 400 ? ('warn' as const) : ('info' as const);
    },
    transport: pretty
      ? { target: 'pino-pretty', options: { singleLine: true } }
      : undefined,
  };
  return { pinoHttp: destination ? [options, destination] : options };
}
