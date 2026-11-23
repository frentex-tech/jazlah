import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { databaseConfig } from '@config/database.config';
import type { DatabaseConfig } from '@config/database-config.type';
import { PrismaClient } from './generated/prisma/client';
import { trackClosing } from '@infra/shutdown/track-closing';
import { trackQueryFailures } from './track-query-failures';

/**
 * The one Prisma client of the API (Prisma 7, through the pg driver adapter), with the
 * pool size, connection timeout and transaction defaults from the `database` config.
 * Connects when the application starts. Disconnects in the last shutdown phase
 * (`onApplicationShutdown`), after the queue workers have closed in `onModuleDestroy`,
 * so a job still running at shutdown can finish its queries.
 *
 * Modules do not inject it: repositories and CRUD services take their client from
 * `DbContext`, and use cases open transactions with `TransactionRunner`, so every
 * query inside a transaction joins it. Both use `trackedClient`.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  /** This client, extended to mark a transaction failed when a query in it fails. */
  readonly trackedClient: PrismaClient;

  constructor(@Inject(databaseConfig.KEY) config: DatabaseConfig) {
    super({
      adapter: new PrismaPg({
        connectionString: config.url,
        max: config.poolSize,
        // pg waits forever by default; a dead database must fail fast instead.
        connectionTimeoutMillis: config.connectionTimeoutMs,
      }),
      transactionOptions: {
        timeout: config.transactionTimeoutMs,
        maxWait: config.transactionMaxWaitMs,
        isolationLevel: config.isolationLevel,
      },
    });
    this.trackedClient = trackQueryFailures(this);
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await trackClosing('database', () => this.$disconnect());
  }
}
