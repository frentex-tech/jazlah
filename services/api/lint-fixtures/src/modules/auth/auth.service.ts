// lint-rule: R14 violates
// auth is a four-layer module: no CRUD service, only its infrastructure/ reaches Prisma.
import { PrismaClient } from '@infra/database/generated/prisma/client';

export class AuthService {
  constructor(private readonly db: PrismaClient) {}

  kind(): string {
    return this.db.kind;
  }
}
