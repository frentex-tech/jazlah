import { Injectable, Module, type OnApplicationShutdown } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { closingResources } from '@infra/shutdown/closing-resources.storage';
import { shutdownOnSignals } from '@infra/shutdown/shutdown-on-signals';
import type { ShutdownLogger } from '@infra/shutdown/shutdown-logger.type';
import { STUCK_SHUTDOWN_DEADLINE_MS } from './stuck-shutdown.constants';

/**
 * Run as its own process by test/shutdown.e2e-spec.ts: an application with one
 * resource that never finishes closing, shut down as main.ts does. Writes one JSON
 * line per log entry to stdout.
 */
@Injectable()
class StuckProbe implements OnApplicationShutdown {
  onApplicationShutdown(): Promise<void> {
    closingResources.begin('stuck-probe');
    return new Promise<void>(() => {});
  }
}

@Module({ providers: [StuckProbe] })
class StuckShutdownModule {}

const write =
  (level: string) =>
  (fields: object, message: string): void => {
    process.stdout.write(
      `${JSON.stringify({ level, ...fields, msg: message })}\n`,
    );
  };
const logger: ShutdownLogger = { log: write('info'), error: write('error') };

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(StuckShutdownModule, {
    logger: false,
  });
  shutdownOnSignals(app, {
    deadlineMs: STUCK_SHUTDOWN_DEADLINE_MS,
    logger,
    exit: (code) => process.exit(code),
  });
  // A real SIGTERM cannot be delivered to a handler on Windows; emit it instead.
  process.emit('SIGTERM', 'SIGTERM');
}

void main();
