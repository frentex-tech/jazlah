import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventPublisher } from './event-publisher';

/**
 * The in-process event bus, global. It wraps `@nestjs/event-emitter`, which nothing
 * else imports (lint rule R16): publish with `EventPublisher`, subscribe with
 * `@OnDomainEvent`.
 *
 * Subscribers are registered in `onApplicationBootstrap`; an event published before
 * the application has finished starting reaches no one.
 */
@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Exact names only: a subscriber names one event class, never a pattern.
      wildcard: false,
      // The warning for many subscribers of one event names the event.
      verboseMemoryLeak: true,
    }),
  ],
  providers: [EventPublisher],
  exports: [EventPublisher],
})
export class EventBusModule {}
