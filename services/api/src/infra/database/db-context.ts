import { Injectable } from '@nestjs/common';
import type { Prisma } from './generated/prisma/client';
import { PrismaService } from './prisma.service';
import { transactionScopeStorage } from './transaction-scope.storage';

/**
 * Where repositories and CRUD services get their database client. `client` is the
 * transaction client of the transaction open in this async context
 * (`TransactionRunner.run`), or the root client outside one, so a write made inside a
 * transaction always joins it. Read it at each query; never keep it in a field.
 *
 *   constructor(private readonly db: DbContext) {}
 *   create(data) { return this.db.client.auditLog.create({ data }); }
 */
@Injectable()
export class DbContext {
  constructor(private readonly prisma: PrismaService) {}

  get client(): Prisma.TransactionClient {
    return (
      transactionScopeStorage.getStore()?.client ?? this.prisma.trackedClient
    );
  }
}
