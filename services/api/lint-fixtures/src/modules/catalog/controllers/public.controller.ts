// lint-rule: R14 violates
import { PrismaClient } from '@infra/database/generated/prisma/client';

export class PublicController {
  constructor(private readonly db: PrismaClient) {}
}
