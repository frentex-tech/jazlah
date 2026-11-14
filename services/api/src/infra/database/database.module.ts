import { Global, Module } from '@nestjs/common';
import { DbContext } from './db-context';
import { IdempotencyRunner } from './idempotency-runner';
import { PrismaService } from './prisma.service';
import { TransactionRunner } from './transaction-runner';

/**
 * Provides the database to the whole application. Global, so modules do not import it.
 * Repositories and CRUD services inject DbContext; use cases inject TransactionRunner,
 * and IdempotencyRunner for work that must happen exactly once.
 * PrismaService itself is for infrastructure (readiness); lint rule R14 decides which
 * files may use Prisma.
 */
@Global()
@Module({
  providers: [PrismaService, DbContext, TransactionRunner, IdempotencyRunner],
  exports: [PrismaService, DbContext, TransactionRunner, IdempotencyRunner],
})
export class DatabaseModule {}
