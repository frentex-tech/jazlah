import { inspect } from 'node:util';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Redis } from 'ioredis';
import { Logger } from 'nestjs-pino';
import { AppConfigModule } from '@config/app-config.module';
import { loadEnv } from '@config/load-env';
import { redisConfig } from '@config/redis.config';
import { LOG_DESTINATION } from '@infra/logger/log-destination.constants';
import { LoggerModule } from '@infra/logger/logger.module';
import { QueueModule } from '@infra/queue/queue.module';
import { QueueRegistrationModule } from '@infra/queue/queue-registration.module';
import { RedisModule } from '@infra/redis/redis.module';
import { LogCapture } from './support/log-capture';

// In its own file: nestjs-pino keeps one root logger per process (per Jest test file),
// so a second application in the same file would log to the first one's destination.

/** Prints a captured line, so the run shows what was actually logged. */
function show(label: string, line: Record<string, unknown>): void {
  process.stdout.write(`${label}:
  ${JSON.stringify(line)}
`);
}

describe('Redis errors in logs (e2e)', () => {
  describe('a Redis authentication failure', () => {
    const password = 'Kn0wn-e2e-Passw0rd';
    let app: INestApplication;
    let url: string;

    beforeAll(() => {
      const redisUrl = new URL(loadEnv().REDIS_URL);
      redisUrl.username = 'jazla-e2e-user';
      redisUrl.password = password;
      url = redisUrl.toString();
    });

    afterAll(async () => {
      await app?.close();
    });

    it('is logged by the shared client and by BullMQ without the password', async () => {
      // Precondition: the error ioredis raises for this URL carries the password.
      const probe = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 0,
        retryStrategy: () => null,
      });
      const raw = new Promise<unknown>((resolve) => {
        probe.once('error', resolve);
      });
      probe.connect().catch(() => undefined);
      const rawError = await raw;
      probe.disconnect();
      expect(inspect(rawError, { depth: 5 })).toContain(password);

      const capture = new LogCapture();
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppConfigModule,
          LoggerModule,
          RedisModule,
          QueueModule,
          QueueRegistrationModule.register({ name: 'e2e-log-auth' }),
        ],
      })
        .overrideProvider(redisConfig.KEY)
        .useValue({ url })
        .overrideProvider(LOG_DESTINATION)
        .useValue(capture.stream)
        .compile();
      app = moduleRef.createNestApplication();
      app.useLogger(app.get(Logger));
      await app.init();

      const shared = await capture.waitFor(
        (line) => line.msg === 'Redis connection error',
      );
      const queue = await capture.waitFor(
        (line) => line.msg === 'Queue connection error',
      );
      show('Redis client', shared);
      show('BullMQ queue', queue);
      expect(shared).toMatchObject({ err: { type: 'ReplyError' } });
      expect(capture.text()).not.toContain(password);
    });
  });
});
