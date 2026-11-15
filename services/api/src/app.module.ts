import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AppConfigModule } from '@config/app-config.module';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { AppValidationPipe } from '@common/pipes/app-validation.pipe';
import { DatabaseModule } from '@infra/database/database.module';
import { EventBusModule } from '@infra/event-bus/event-bus.module';
import { HealthModule } from '@infra/health/health.module';
import { LoggerModule } from '@infra/logger/logger.module';
import { QueueModule } from '@infra/queue/queue.module';
import { RateLimitModule } from '@infra/rate-limit/rate-limit.module';
import { RedisModule } from '@infra/redis/redis.module';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    RedisModule,
    QueueModule,
    EventBusModule,
    RateLimitModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useClass: AppValidationPipe },
  ],
})
export class AppModule {}
