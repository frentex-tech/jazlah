import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { httpConfig } from './http.config';
import { loggerConfig } from './logger.config';
import { mediaConfig } from './media.config';
import { queueConfig } from './queue.config';
import { rateLimitConfig } from './rate-limit.config';
import { redisConfig } from './redis.config';
import { storageConfig } from './storage.config';

/**
 * Loads `.env` files into the environment and provides the typed namespaces
 * globally. The namespaces share one validated environment (`load-env.ts`), so an
 * invalid environment stops the application before it listens.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [
        appConfig,
        loggerConfig,
        databaseConfig,
        redisConfig,
        queueConfig,
        httpConfig,
        rateLimitConfig,
        storageConfig,
        mediaConfig,
      ],
    }),
  ],
})
export class AppConfigModule {}
