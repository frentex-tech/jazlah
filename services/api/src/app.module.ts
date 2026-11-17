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
import { AuthModule } from '@modules/auth';
import { CatalogModule } from '@modules/catalog';
import { MediaModule } from '@modules/media';
import { CustomersModule } from '@modules/customers';
import { VendorsModule } from '@modules/vendors';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    DatabaseModule,
    RedisModule,
    QueueModule,
    EventBusModule,
    RateLimitModule,
    // After RateLimitModule, always: it registers the authentication guard, which must
    // run after the rate limit guard, and the organisation status guard after it
    // (.claude/rules/http.md, "Guard order").
    AuthModule,
    HealthModule,
    MediaModule,
    VendorsModule,
    CatalogModule,
    CustomersModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useClass: AppValidationPipe },
  ],
})
export class AppModule {}
