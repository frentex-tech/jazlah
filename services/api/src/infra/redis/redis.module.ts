import { Global, Module } from '@nestjs/common';
import { RedisReadinessCheck } from './redis-readiness.check';
import { RedisService } from './redis.service';

/** Provides the one shared RedisService, and its readiness check, to the whole application. */
@Global()
@Module({
  providers: [RedisService, RedisReadinessCheck],
  exports: [RedisService, RedisReadinessCheck],
})
export class RedisModule {}
