import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { runInTransaction } from './run-in-transaction';
import type { TransactionOptions } from './transaction-options.type';

/**
 * Opens database transactions for use cases and services. Everything `work` does
 * through repositories (which use `DbContext`) commits together or not at all; a call
 * inside an open transaction joins it. Behaviour and retries: `runInTransaction`;
 * rules: `.claude/rules/database.md`, "Transactions".
 *
 *   await this.transactions.run(async () => {
 *     await this.orders.markPaid(orderId);
 *     await this.ledger.record(entry);
 *   });
 */
@Injectable()
export class TransactionRunner {
  constructor(private readonly prisma: PrismaService) {}

  run<T>(work: () => Promise<T>, options?: TransactionOptions): Promise<T> {
    return runInTransaction(this.prisma, work, options);
  }
}
