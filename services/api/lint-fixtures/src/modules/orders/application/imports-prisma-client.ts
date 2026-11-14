// lint-rule: R14 violates
import { PrismaClient } from '@infra/database/generated/prisma/client';

export const client = new PrismaClient();
