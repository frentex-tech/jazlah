import { appConfig } from '@config/app.config';
import type { AppConfig } from '@config/app-config.type';
import { loggerConfig } from '@config/logger.config';
import type { LoggerConfig } from '@config/logger-config.type';
import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import type { DestinationStream } from 'pino';
import type { HttpLogger } from 'pino-http';
import { createLoggerParams } from './create-logger-params';
import { createRequestLogger } from './create-request-logger';
import { LOG_DESTINATION } from './log-destination.constants';
import { REQUEST_LOGGER } from './request-logger.constants';

/**
 * The application logger (pino, through nestjs-pino). `src/main.ts` makes it Nest's
 * logger; elsewhere inject `PinoLogger` or use Nest's `Logger`, and the request id
 * is added to each line on its own. What a line may contain: `createLoggerParams`.
 *
 * The request logger (REQUEST_LOGGER, pino-http) is mounted by `configureHttpApp`, first
 * in the middleware chain and for every path, not by nestjs-pino: nestjs-pino mounts its
 * middleware at `init()`, after the body parser, and only under the `/v1` prefix, so a
 * malformed body or a request to an unknown path went unlogged. nestjs-pino runs with
 * `useExisting`: it binds each request's logger for Nest's Logger and writes everything
 * else through a child of the request logger's pino instance (same settings, same
 * destination).
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      providers: [
        { provide: LOG_DESTINATION, useValue: null },
        {
          provide: REQUEST_LOGGER,
          inject: [appConfig.KEY, loggerConfig.KEY, LOG_DESTINATION],
          useFactory: (
            app: AppConfig,
            logger: LoggerConfig,
            destination: DestinationStream | null,
          ): HttpLogger =>
            createRequestLogger(
              createLoggerParams(
                app,
                logger,
                undefined,
                destination ?? undefined,
              ),
            ),
        },
      ],
      inject: [REQUEST_LOGGER],
      useFactory: (requestLogger: HttpLogger) => ({
        // The serializers are already on the instance: do not wrap them a second time.
        pinoHttp: { logger: requestLogger.logger, wrapSerializers: false },
        useExisting: true,
      }),
    }),
  ],
})
export class LoggerModule {}
