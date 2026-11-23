import { Module } from '@nestjs/common';
import { QueueRegistrationModule } from '@infra/queue/queue-registration.module';
import { EVENT_PROBE_QUEUE } from './event-probe-queue.constants';
import { FaultyProbeSubscriber } from './faulty-probe.subscriber';
import { HealthyProbeSubscriber } from './healthy-probe.subscriber';
import { ProbeCompletedSubscriber } from './probe-completed.subscriber';
import { ProbeFollowUpProcessor } from './probe-follow-up.processor';
import { ProbeHappenedSubscriber } from './probe-happened.subscriber';

/** Test module B: reacts to the events of module A, and owns its queue and processor. */
@Module({
  imports: [QueueRegistrationModule.register({ name: EVENT_PROBE_QUEUE })],
  providers: [
    ProbeHappenedSubscriber,
    FaultyProbeSubscriber,
    HealthyProbeSubscriber,
    ProbeCompletedSubscriber,
    ProbeFollowUpProcessor,
  ],
})
export class EventProbeSubscriberModule {}
