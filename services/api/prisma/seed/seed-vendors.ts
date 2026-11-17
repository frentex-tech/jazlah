import { encryptAes256Gcm } from '@common/crypto/encrypt-aes-256-gcm';
import { SEED_IBAN } from './data/seed-iban.constants';
import { SEED_PARTNER_VENDORS } from './data/partner-vendors.constants';
import type { SeedPartnerVendor } from './data/seed-partner-vendor.type';
import type { SeedVendorApplication } from './data/seed-vendor-application.type';
import { SEED_VENDOR_APPLICATIONS } from './data/vendor-applications.constants';
import { applicationDocumentFile } from './application-document-file';
import { encodeSolidPng } from './encode-solid-png';
import { ensureSeedFile } from './ensure-seed-file';
import { pickId } from './pick-id';
import type { SeedContext } from './seed-context.type';
import type { SeedFile } from './seed-file.type';
import { seedId } from './seed-id';
import { seedTime } from './seed-time';

/**
 * The vendor applications with their documents, then the partner vendors made from the
 * approved ones, as an admin's approval makes them (ApproveVendorApplicationUseCase):
 * names, description, business and bank details copied from the application, the first
 * commission entry (changed by the admin), and vendor access for the applicant
 * (UsersService.grantVendorAccess). The suspended one has its time and reason. Each
 * application and each vendor is created with everything it owns in one transaction,
 * only when its id is free, so a second run, or a vendor a developer edited, is left
 * as it is. Returns the vendor id of each SeedPartnerVendor key.
 */
export async function seedVendors(
  context: SeedContext,
  users: ReadonlyMap<string, string>,
  adminId: string,
): Promise<ReadonlyMap<string, string>> {
  for (const [index, application] of SEED_VENDOR_APPLICATIONS.entries()) {
    await seedApplication(context, application, index, users, adminId);
  }
  const vendorIds = new Map<string, string>();
  for (const [index, vendor] of SEED_PARTNER_VENDORS.entries()) {
    vendorIds.set(
      vendor.key,
      await seedPartnerVendor(context, vendor, index, adminId),
    );
  }
  return vendorIds;
}

async function seedApplication(
  context: SeedContext,
  application: SeedVendorApplication,
  index: number,
  users: ReadonlyMap<string, string>,
  adminId: string,
): Promise<void> {
  const { db, transactions, tally } = context;
  const applicantId = pickId(users, application.applicant, 'user');
  const files = application.documents.map((kind) =>
    applicationDocumentFile(application, kind, applicantId),
  );
  // Storage first, outside the transaction (database.md, Transactions).
  for (const file of files) {
    await ensureSeedFile(context, file);
  }
  const id = seedId(`vendor-application:${application.key}`);
  const submittedAt = seedTime(24 + index);
  const decided = application.status !== 'pending';
  const created = await transactions.run(async () => {
    const existing = await db.client.vendorApplication.findUnique({
      where: { id },
      select: { id: true },
    });
    if (existing !== null) {
      return false;
    }
    const iban = encryptAes256Gcm(SEED_IBAN.electronic, context.ibanKey);
    await db.client.vendorApplication.create({
      data: {
        id,
        applicantId,
        nameAr: application.nameAr,
        nameEn: application.nameEn,
        descriptionAr: application.descriptionAr,
        descriptionEn: application.descriptionEn,
        commercialRegistrationNumber: application.commercialRegistrationNumber,
        ibanEncrypted: iban.ciphertext,
        ibanKeyId: iban.keyId,
        ibanLast4: SEED_IBAN.last4,
        accountHolderName: application.accountHolderName,
        latitude: application.latitude,
        longitude: application.longitude,
        status: application.status,
        rejectionReason: application.rejectionReason,
        reviewedById: decided ? adminId : null,
        reviewedAt: decided ? seedTime(30 + index) : null,
        createdAt: submittedAt,
        documents: {
          create: application.documents.map((kind, position) => ({
            id: seedId(
              `vendor-application-document:${application.key}:${kind}`,
            ),
            kind,
            mediaId: files[position].id,
            createdAt: submittedAt,
          })),
        },
      },
    });
    return true;
  });
  tally.one('vendor applications', created);
}

async function seedPartnerVendor(
  context: SeedContext,
  vendor: SeedPartnerVendor,
  index: number,
  adminId: string,
): Promise<string> {
  const { db, transactions, tally } = context;
  const id = seedId(`vendor:${vendor.key}`);
  const applicationId = seedId(`vendor-application:${vendor.application}`);
  const application = await db.client.vendorApplication.findUnique({
    where: { id: applicationId },
  });
  if (application === null || application.status !== 'approved') {
    throw new Error(
      `Seed vendor ${vendor.key} needs the approved application ${vendor.application}`,
    );
  }
  const logo: SeedFile = {
    id: seedId(`media:vendor-logo:${vendor.key}`),
    purpose: 'vendor.logo',
    contentType: 'image/png',
    bytes: encodeSolidPng(256, 256, vendor.logoColor),
    ownerId: application.applicantId,
    fileName: `${vendor.key}-logo.png`,
  };
  await ensureSeedFile(context, logo);
  const approvedAt = application.reviewedAt ?? seedTime(30 + index);
  const suspended = vendor.suspensionReason !== null;
  const created = await transactions.run(async () => {
    const existing = await db.client.vendor.findUnique({
      where: { id },
      select: { id: true },
    });
    if (existing !== null) {
      return false;
    }
    await db.client.vendor.create({
      data: {
        id,
        nameAr: application.nameAr,
        nameEn: application.nameEn,
        descriptionAr: application.descriptionAr,
        descriptionEn: application.descriptionEn,
        logoMediaId: logo.id,
        isPlatform: false,
        status: suspended ? 'suspended' : 'active',
        suspendedAt: suspended ? seedTime(72 + index) : null,
        suspensionReason: vendor.suspensionReason,
        commissionBasisPoints: vendor.commissionBasisPoints,
        commercialRegistrationNumber: application.commercialRegistrationNumber,
        ibanEncrypted: application.ibanEncrypted,
        ibanKeyId: application.ibanKeyId,
        ibanLast4: application.ibanLast4,
        accountHolderName: application.accountHolderName,
        latitude: application.latitude,
        longitude: application.longitude,
        applicationId,
        createdAt: approvedAt,
        commissionChanges: {
          create: [
            {
              id: seedId(`vendor-commission-change:${vendor.key}:1`),
              commissionBasisPoints: vendor.commissionBasisPoints,
              previousCommissionBasisPoints: null,
              changedById: adminId,
              createdAt: approvedAt,
            },
          ],
        },
      },
    });
    await context.users.grantVendorAccess(application.applicantId, id);
    return true;
  });
  tally.one('partner vendors', created);
  return id;
}
