import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { redisConfig } from '@config/redis.config';
import { trackClosing } from '@infra/shutdown/track-closing';
import type { RedisConfig } from '@config/redis-config.type';
import {
  REDIS_CONNECT_TIMEOUT_MS,
  REDIS_MAX_RETRIES_PER_REQUEST,
} from './redis.constants';

/**
 * The one shared Redis client for general use (an ioredis client), built from the
 * `redis` config. It connects when created, reconnects by itself, and closes in the
 * last shutdown phase, after workers have finished their jobs.
 *
 * BullMQ does not use it: queues and workers open their own connections
 * (`src/infra/queue/`).
 */
@Injectable()
export class RedisService extends Redis implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);
  private reportedDown = false;

  constructor(@Inject(redisConfig.KEY) config: RedisConfig) {
    // ioredis reads host, port, credentials, logical database and TLS (`rediss://`) from the URL.
    super(config.url, {
      connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
      maxRetriesPerRequest: REDIS_MAX_RETRIES_PER_REQUEST,
    });
    // Without a listener ioredis prints every connection error to the console. Log the
    // first one of an outage at warn; the readiness check reports the state.
    this.on('error', (error: Error) => {
      if (!this.reportedDown) {
        this.reportedDown = true;
        this.logger.warn({ err: error }, 'Redis connection error');
      }
    });
    this.on('ready', () => {
      this.reportedDown = false;
    });
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.status === 'end') {
      return;
    }
    await trackClosing('redis', async () => {
      try {
        await this.quit();
      } catch {
        // QUIT cannot be sent while Redis is unreachable: drop the connection instead.
        this.disconnect();
      }
    });
  }
}
