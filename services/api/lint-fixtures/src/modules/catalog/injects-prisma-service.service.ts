// lint-rule: R14 violates
import { PrismaService } from '@infra/database/prisma.service';

export class CatalogReportService {
  constructor(private readonly prisma: PrismaService) {}

  kind(): string {
    return this.prisma.kind;
  }
}
