import { Module } from '@nestjs/common';
import { AuditModule } from '@infra/audit/audit.module';
import { CreatePlatformVendorUseCase } from './application/create-platform-vendor.use-case';
import { VENDOR_COMMISSION_HISTORY } from './domain/ports/vendor-commission-history.port';
import { VENDOR_REPOSITORY } from './domain/ports/vendor.repository.port';
import { PrismaVendorCommissionHistory } from './infrastructure/prisma-vendor-commission-history.repository';
import { PrismaVendorRepository } from './infrastructure/prisma-vendor.repository';

/**
 * The vendors and their commission history (VENDOR_REPOSITORY,
 * VENDOR_COMMISSION_HISTORY) and the creation of the platform vendor: what
 * `pnpm vendor:create-platform` needs, with nothing but the database (no storage, no
 * queue). VendorsModule imports it and binds every other port; each port is bound once,
 * here or there.
 */
@Module({
  imports: [AuditModule],
  providers: [
    CreatePlatformVendorUseCase,
    { provide: VENDOR_REPOSITORY, useClass: PrismaVendorRepository },
    {
      provide: VENDOR_COMMISSION_HISTORY,
      useClass: PrismaVendorCommissionHistory,
    },
  ],
  exports: [
    CreatePlatformVendorUseCase,
    VENDOR_REPOSITORY,
    VENDOR_COMMISSION_HISTORY,
  ],
})
export class PlatformVendorModule {}
