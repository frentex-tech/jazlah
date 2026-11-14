import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { appConfig } from '@config/app.config';
import type { AppConfig } from '@config/app-config.type';
import { EnvValidationError } from '@config/env-validation.error';
import { loadEnv } from '@config/load-env';
import { configureHttpApp } from '@infra/http/configure-http-app';
import { shutdownOnSignals } from '@infra/shutdown/shutdown-on-signals';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // Validate the environment before Nest starts, so an invalid one is reported once,
  // cleanly, by the handler below. ConfigModule has begun loading `.env` files when
  // AppModule was imported; wait for it to finish first.
  await ConfigModule.envVariablesLoaded;
  loadEnv();

  // abortOnError: false makes any other startup failure reject here instead of
  // aborting the process, so the handler below can print it and exit with code 1.
  // bodyParser: false: configureHttpApp registers the parsers with the configured limit.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    abortOnError: false,
    bodyParser: false,
  });
  const logger = app.get(Logger);
  app.useLogger(logger);
  // On SIGTERM and SIGINT, runs the shutdown hooks (workers finish in onModuleDestroy,
  // then the database and Redis connections close in onApplicationShutdown) under an
  // overall deadline: past SHUTDOWN_DEADLINE_MS the process logs what was still closing
  // and exits with code 1, instead of waiting for the orchestrator to kill it.
  const { port, shutdownDeadlineMs } = app.get<AppConfig>(appConfig.KEY);
  shutdownOnSignals(app, {
    deadlineMs: shutdownDeadlineMs,
    logger,
    exit: (code) => process.exit(code),
  });
  // Security headers, CORS, trusted proxies, body limit, the /v1 prefix and /docs.
  configureHttpApp(app);
  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  // An invalid environment prints only its message, which names each variable and
  // never its value. Anything else prints in full: no logger may exist yet.
  const text =
    error instanceof EnvValidationError
      ? error.message
      : error instanceof Error
        ? (error.stack ?? error.message)
        : String(error);
  process.stderr.write(`${text}\n`);
  process.exit(1);
});
