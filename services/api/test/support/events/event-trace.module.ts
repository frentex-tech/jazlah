import { Global, Module } from '@nestjs/common';
import { EventTrace } from './event-trace';

/** Shares one EventTrace between the test publisher and subscriber modules. */
@Global()
@Module({ providers: [EventTrace], exports: [EventTrace] })
export class EventTraceModule {}
