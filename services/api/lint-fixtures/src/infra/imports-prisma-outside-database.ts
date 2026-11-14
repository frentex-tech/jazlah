// lint-rule: R14 violates
import { PrismaClient } from './database/generated/prisma/client';

export const client = new PrismaClient();
