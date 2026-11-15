import { Module } from '@nestjs/common';
import { VENDOR_STATUS_CHECKER } from '@common/auth/vendor-status-checker.constants';
import { AuditModule } from '@infra/audit/audit.module';
import { MediaModule } from '@modules/media';
import { UsersModule } from '@modules/users';
import { AdminVendorsController } from './api/controllers/admin.controller';
import { CustomerVendorsController } from './api/controllers/customer.controller';
import { PublicVendorsController } from './api/controllers/public.controller';
import { VendorVendorsController } from './api/controllers/vendor.controller';
import { ApproveVendorApplicationUseCase } from './application/approve-vendor-application.use-case';
import { ChangeVendorCommissionUseCase } from './application/change-vendor-commission.use-case';
import { GetLatestVendorApplicationUseCase } from './application/get-latest-vendor-application.use-case';
import { GetPublicVendorUseCase } from './application/get-public-vendor.use-case';
import { GetVendorApplicationUseCase } from './application/get-vendor-application.use-case';
import { GetVendorUseCase } from './application/get-vendor.use-case';
import { ListPublicVendorsUseCase } from './application/list-public-vendors.use-case';
import { ListVendorApplicationsUseCase } from './application/list-vendor-applications.use-case';
import { ListVendorCommissionChangesUseCase } from './application/list-vendor-commission-changes.use-case';
import { ListVendorsUseCase } from './application/list-vendors.use-case';
import { ReinstateVendorUseCase } from './application/reinstate-vendor.use-case';
import { RejectVendorApplicationUseCase } from './application/reject-vendor-application.use-case';
import { SubmitVendorApplicationUseCase } from './application/submit-vendor-application.use-case';
import { SuspendVendorUseCase } from './application/suspend-vendor.use-case';
import { UpdateOwnVendorProfileUseCase } from './application/update-own-vendor-profile.use-case';
import { IBAN_CIPHER } from './domain/ports/iban-cipher.port';
import { VENDOR_ACCESS } from './domain/ports/vendor-access.port';
import { VENDOR_APPLICATION_REPOSITORY } from './domain/ports/vendor-application.repository.port';
import { VENDOR_MEDIA } from './domain/ports/vendor-media.port';
import { AesGcmIbanCipher } from './infrastructure/aes-gcm-iban-cipher';
import { MediaServiceVendorMedia } from './infrastructure/media-service-vendor-media';
import { PrismaVendorApplicationRepository } from './infrastructure/prisma-vendor-application.repository';
import { RepositoryVendorStatusChecker } from './infrastructure/repository-vendor-status-checker';
import { UsersServiceVendorAccess } from './infrastructure/users-service-vendor-access';
import { PlatformVendorModule } from './platform-vendor.module';

/**
 * Vendors: applications and their review, the vendors themselves (status, commission
 * and its history, profile), and the platform's own vendor. Four layers, like auth:
 * the review is a state machine, the IBAN has rules, the commission a history.
 *
 * This file binds the ports, except the two PlatformVendorModule binds for the platform
 * vendor command (the vendor repository and the commission history). It also provides
 * VENDOR_STATUS_CHECKER (exported), which the organisation status guard and
 * the auth module use to refuse suspended vendors.
 */
@Module({
  imports: [AuditModule, MediaModule, UsersModule, PlatformVendorModule],
  controllers: [
    CustomerVendorsController,
    VendorVendorsController,
    AdminVendorsController,
    PublicVendorsController,
  ],
  providers: [
    SubmitVendorApplicationUseCase,
    GetLatestVendorApplicationUseCase,
    ListVendorApplicationsUseCase,
    GetVendorApplicationUseCase,
    ApproveVendorApplicationUseCase,
    RejectVendorApplicationUseCase,
    ListVendorsUseCase,
    GetVendorUseCase,
    SuspendVendorUseCase,
    ReinstateVendorUseCase,
    ChangeVendorCommissionUseCase,
    ListVendorCommissionChangesUseCase,
    UpdateOwnVendorProfileUseCase,
    ListPublicVendorsUseCase,
    GetPublicVendorUseCase,
    {
      provide: VENDOR_APPLICATION_REPOSITORY,
      useClass: PrismaVendorApplicationRepository,
    },
    { provide: IBAN_CIPHER, useClass: AesGcmIbanCipher },
    { provide: VENDOR_MEDIA, useClass: MediaServiceVendorMedia },
    { provide: VENDOR_ACCESS, useClass: UsersServiceVendorAccess },
    { provide: VENDOR_STATUS_CHECKER, useClass: RepositoryVendorStatusChecker },
  ],
  exports: [VENDOR_STATUS_CHECKER],
})
export class VendorsModule {}
