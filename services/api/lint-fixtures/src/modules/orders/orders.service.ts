// lint-rule: R14 violates
// A four-layer module has no CRUD service: only its infrastructure/ reaches Prisma.
import { PrismaClient } from '@infra/database/generated/prisma/client';

export class OrdersService {
  constructor(private readonly db: PrismaClient) {}

  kind(): string {
    return this.db.kind;
  }
}
