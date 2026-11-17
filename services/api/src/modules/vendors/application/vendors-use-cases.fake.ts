import type { TransactionRunner } from '@infra/database/transaction-runner';
import { InMemoryAuditLog } from '@infra/audit/in-memory-audit-log.fake';
import { InMemoryApplicantAccounts } from '../domain/fakes/in-memory-applicant-accounts.fake';
import { InMemoryIbanCipher } from '../domain/fakes/in-memory-iban-cipher.fake';
import { InMemoryVendorAccess } from '../domain/fakes/in-memory-vendor-access.fake';
import { InMemoryVendorApplicationRepository } from '../domain/fakes/in-memory-vendor-application.repository.fake';
import { InMemoryVendorCommissionHistory } from '../domain/fakes/in-memory-vendor-commission-history.fake';
import { InMemoryVendorMedia } from '../domain/fakes/in-memory-vendor-media.fake';
import { InMemoryVendorRepository } from '../domain/fakes/in-memory-vendor.repository.fake';
import { ApproveVendorApplicationUseCase } from './approve-vendor-application.use-case';
import { ChangeVendorCommissionUseCase } from './change-vendor-commission.use-case';
import { CreatePlatformVendorUseCase } from './create-platform-vendor.use-case';
import { EraseApplicantDataUseCase } from './erase-applicant-data.use-case';
import { GetLatestVendorApplicationUseCase } from './get-latest-vendor-application.use-case';
import { GetPublicVendorUseCase } from './get-public-vendor.use-case';
import { GetVendorApplicationUseCase } from './get-vendor-application.use-case';
import { GetVendorUseCase } from './get-vendor.use-case';
import { ListPublicVendorsUseCase } from './list-public-vendors.use-case';
import { ListVendorApplicationsUseCase } from './list-vendor-applications.use-case';
import { ListVendorCommissionChangesUseCase } from './list-vendor-commission-changes.use-case';
import { ListVendorsUseCase } from './list-vendors.use-case';
import { ReinstateVendorUseCase } from './reinstate-vendor.use-case';
import { RejectVendorApplicationUseCase } from './reject-vendor-application.use-case';
import { SubmitVendorApplicationUseCase } from './submit-vendor-application.use-case';
import { SuspendVendorUseCase } from './suspend-vendor.use-case';
import { UpdateOwnVendorProfileUseCase } from './update-own-vendor-profile.use-case';
import { UpdateVendorProfileAsAdminUseCase } from './update-vendor-profile-as-admin.use-case';

/**
 * Every use case of the vendors module wired to the in-memory fakes of its ports, for
 * the unit tests: no database, no Nest application. Transactions are real enough to
 * test with: when the work throws, what it wrote to the fakes is put back, as a rollback
 * would.
 */
export function buildVendorsUseCases() {
  const applications = new InMemoryVendorApplicationRepository();
  const vendors = new InMemoryVendorRepository(applications);
  const history = new InMemoryVendorCommissionHistory();
  const cipher = new InMemoryIbanCipher();
  const media = new InMemoryVendorMedia();
  const access = new InMemoryVendorAccess();
  const accounts = new InMemoryApplicantAccounts();
  const audit = new InMemoryAuditLog();

  const transactions: Pick<TransactionRunner, 'run'> = {
    async run<T>(work: () => Promise<T>): Promise<T> {
      const before = {
        applications: applications.rows,
        vendors: vendors.rows,
        history: history.rows,
        access: access.grants,
        audit: audit.rows,
      };
      try {
        return await work();
      } catch (error) {
        applications.rows = before.applications;
        vendors.rows = before.vendors;
        history.rows = before.history;
        access.grants = before.access;
        audit.rows = before.audit;
        throw error;
      }
    },
  };

  return {
    applications,
    vendors,
    history,
    cipher,
    media,
    access,
    accounts,
    audit,
    submitApplication: new SubmitVendorApplicationUseCase(
      applications,
      media,
      cipher,
      access,
      accounts,
      transactions,
    ),
    eraseApplicantData: new EraseApplicantDataUseCase(applications, media),
    getLatestApplication: new GetLatestVendorApplicationUseCase(applications),
    listApplications: new ListVendorApplicationsUseCase(applications),
    getApplication: new GetVendorApplicationUseCase(applications, media),
    approveApplication: new ApproveVendorApplicationUseCase(
      applications,
      vendors,
      history,
      access,
      audit,
      transactions,
    ),
    rejectApplication: new RejectVendorApplicationUseCase(
      applications,
      audit,
      transactions,
    ),
    listVendors: new ListVendorsUseCase(vendors, media),
    getVendor: new GetVendorUseCase(vendors, media),
    suspendVendor: new SuspendVendorUseCase(
      vendors,
      media,
      audit,
      transactions,
    ),
    reinstateVendor: new ReinstateVendorUseCase(
      vendors,
      media,
      audit,
      transactions,
    ),
    changeCommission: new ChangeVendorCommissionUseCase(
      vendors,
      media,
      history,
      audit,
      transactions,
    ),
    listCommissionChanges: new ListVendorCommissionChangesUseCase(
      vendors,
      history,
    ),
    updateProfile: new UpdateOwnVendorProfileUseCase(vendors, media),
    updateProfileAsAdmin: new UpdateVendorProfileAsAdminUseCase(
      vendors,
      media,
      audit,
      transactions,
    ),
    listPublicVendors: new ListPublicVendorsUseCase(vendors, media),
    getPublicVendor: new GetPublicVendorUseCase(vendors, media),
    createPlatformVendor: new CreatePlatformVendorUseCase(
      vendors,
      history,
      audit,
      transactions,
    ),
  };
}

export type VendorsKit = ReturnType<typeof buildVendorsUseCases>;
