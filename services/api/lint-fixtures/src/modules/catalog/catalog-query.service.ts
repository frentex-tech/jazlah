// lint-rule: R14 conforms
import { PrismaClient } from '@infra/database/generated/prisma/client';

export class CatalogQueryService {
  constructor(private readonly db: PrismaClient) {}

  kind(): string {
    return this.db.kind;
  }
}
