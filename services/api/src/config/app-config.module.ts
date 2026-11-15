import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { httpConfig } from './http.config';
import { loggerConfig } from './logger.config';
import { rateLimitConfig } from './rate-limit.config';
import { redisConfig } from './redis.config';

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
        httpConfig,
        rateLimitConfig,
      ],
    }),
  ],
})
export class AppConfigModule {}
