import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ReadinessService } from './readiness.service';
import { ShutdownState } from './shutdown-state';

/**
 * Liveness and readiness. PrismaService and RedisReadinessCheck come from the global
 * DatabaseModule and RedisModule.
 */
@Module({
  controllers: [HealthController],
  providers: [ReadinessService, ShutdownState],
})
export class HealthModule {}
