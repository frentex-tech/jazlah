import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { OnDomainEvent } from '@infra/event-bus/on-domain-event.decorator';
import { EventTrace } from './event-trace';
import { ProbeHappenedEvent } from './probe-happened.event';

/**
 * Records each delivery, and whether the probe's audit row was visible to it: a
 * subscriber reading current data sees the row only if the transaction had committed.
 */
@Injectable()
export class ProbeHappenedSubscriber {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trace: EventTrace,
  ) {}

  @OnDomainEvent(ProbeHappenedEvent)
  async onProbeHappened(event: ProbeHappenedEvent): Promise<void> {
    // Written before any await, so the trace shows when delivery began.
    this.trace.add(`delivery-started:${event.probeId}`);
    const row = await this.prisma.auditLog.findUnique({
      where: { id: event.probeId },
    });
    this.trace.add(
      `delivered:${event.probeId}:${row === null ? 'row-absent' : 'row-visible'}`,
    );
  }
}
