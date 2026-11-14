import { Module } from '@nestjs/common';
import { EventProbePublisherService } from './event-probe-publisher.service';

/** Test module A: publishes. It knows nothing about the subscribers. */
@Module({
  providers: [EventProbePublisherService],
  exports: [EventProbePublisherService],
})
export class EventProbePublisherModule {}
