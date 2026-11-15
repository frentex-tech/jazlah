import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
} from '@nestjs/common';
import { SHUTDOWN_SIGNALS } from './health.constants';

/**
 * Whether the application has begun to shut down, for readiness: from that moment the
 * readiness check answers 503, so the load balancer stops sending new requests while
 * the instance drains (workers finishing their jobs can take 25 s).
 *
 * Set when SIGTERM or SIGINT arrives, before Nest runs any shutdown hook (Node calls
 * this listener as the signal arrives; Nest's own listener only starts an asynchronous
 * close), and in `onModuleDestroy` for a close without a signal (`app.close()`).
 */
@Injectable()
export class ShutdownState
  implements OnApplicationBootstrap, OnModuleDestroy, OnApplicationShutdown
{
  private shuttingDown = false;
  private readonly onSignal = (): void => {
    this.shuttingDown = true;
  };

  get draining(): boolean {
    return this.shuttingDown;
  }

  onApplicationBootstrap(): void {
    for (const signal of SHUTDOWN_SIGNALS) {
      process.on(signal, this.onSignal);
    }
  }

  onModuleDestroy(): void {
    this.shuttingDown = true;
  }

  onApplicationShutdown(): void {
    for (const signal of SHUTDOWN_SIGNALS) {
      process.off(signal, this.onSignal);
    }
  }
}
