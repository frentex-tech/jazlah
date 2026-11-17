import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '@infra/database/prisma.service';
import type { FakeSmsProvider } from '@integrations/sms/testing';
import type { FakeStorageProvider } from '@integrations/storage/testing';
import { UsersService } from '@modules/users';
import { AuthClient, type SignedInBody } from './auth-client';
import { testPhone } from './test-phone';

/** File starts the content type detection recognises. */
export const FILE_STARTS = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
} as const;

/** A valid Saudi IBAN (a published example), as people type it. */
export const TEST_IBAN = 'SA03 8000 0000 6080 1016 7519';

/** What an upload request answers (dates as JSON strings). */
type Ticket = {
  mediaId: string;
  url: string;
  fields: Record<string, string>;
  expiresAt: string;
};

/** A signed-in user of a test: the phone, the user, and the tokens of one audience. */
export type TestUser = Readonly<{
  phone: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
}>;

/**
 * The steps of the vendor e2e tests, against the real application with the fake sms
 * provider (codes) and the fake storage provider (uploads): signing in for an audience,
 * uploading and confirming files through the media endpoints, applying, approving.
 * Phones come from testPhone (each test its own), and everything a journey creates is
 * remembered so `cleanUp` deletes it, in foreign-key order, after the suite.
 */
export class VendorJourney {
  private readonly auth: AuthClient;
  private readonly phones: string[] = [];
  /** Every user signed in, also found after the account was deleted (no phone then). */
  private readonly userIds = new Set<string>();
  private readonly mediaIds: string[] = [];
  private labels = 0;

  constructor(
    private readonly app: INestApplication<App>,
    sms: FakeSmsProvider,
    private readonly storage: FakeStorageProvider,
  ) {
    this.auth = new AuthClient(app, sms);
  }

  get http(): ReturnType<typeof request> {
    return request(this.app.getHttpServer());
  }

  /** A new phone of the running test. */
  phone(label = ''): string {
    this.labels += 1;
    const phone = testPhone(`${label}#${this.labels}`);
    this.phones.push(phone);
    return phone;
  }

  /** Signs `phone` in for `audience`. */
  async signIn(phone: string, audience: string): Promise<TestUser> {
    const body: SignedInBody = await this.auth.signIn(phone, audience);
    this.userIds.add(body.principal.userId);
    return {
      phone,
      userId: body.principal.userId,
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    };
  }

  refresh(refreshToken: string): request.Test {
    return this.auth.refresh(refreshToken);
  }

  /** Requests a code for `phone` and verifies it, returning the raw response. */
  async verify(phone: string, audience: string): Promise<request.Response> {
    await this.auth.requestCode(phone, audience).expect(200);
    return this.auth.verify(phone, await this.auth.codeFor(phone), audience);
  }

  /** A new customer, signed in. */
  customer(label = 'customer'): Promise<TestUser> {
    return this.signIn(this.phone(label), 'customer');
  }

  /** A new admin (granted as `pnpm admin:create` does), signed in. */
  async admin(): Promise<TestUser> {
    const phone = this.phone('admin');
    await this.app.get(UsersService).grantAdminAccess(phone);
    return this.signIn(phone, 'admin');
  }

  /** Uploads a file through an audience's media endpoints and confirms it. */
  async uploadedFile(
    user: TestUser,
    audience: 'customer' | 'vendor' | 'admin',
    purpose: string,
    kind: keyof typeof FILE_STARTS,
  ): Promise<string> {
    const contentType = kind === 'pdf' ? 'application/pdf' : 'image/png';
    const ticket = (
      await this.http
        .post(`/v1/${audience}/media/uploads`)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ purpose, contentType })
        .expect(201)
    ).body as Ticket;
    this.mediaIds.push(ticket.mediaId);
    const bytes = new Uint8Array(1_024);
    bytes.set(FILE_STARTS[kind]);
    this.storage.upload(
      {
        url: ticket.url,
        fields: ticket.fields,
        expiresAt: new Date(ticket.expiresAt),
      },
      { bytes, contentType },
    );
    await this.http
      .post(`/v1/${audience}/media/${ticket.mediaId}/confirm`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);
    return ticket.mediaId;
  }

  /** One confirmed document of each kind, uploaded by `customer`. */
  async documents(
    customer: TestUser,
  ): Promise<{ kind: string; mediaId: string }[]> {
    const documents = [];
    for (const kind of [
      'commercial_registration',
      'health_certificate',
      'facility_photo',
    ]) {
      documents.push({
        kind,
        mediaId: await this.uploadedFile(
          customer,
          'customer',
          'vendor.document',
          'pdf',
        ),
      });
    }
    return documents;
  }

  /** The body of a valid application with these documents. */
  applicationBody(
    documents: { kind: string; mediaId: string }[],
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return {
      name: { ar: 'ملحمة النخبة', en: 'Al Nokhba Butchery' },
      description: { ar: 'لحوم بلدية', en: 'Local meat' },
      commercialRegistrationNumber: '١٠١٠١٢٣٤٥٦',
      city: ' الرياض ',
      iban: TEST_IBAN,
      accountHolderName: 'مؤسسة النخبة للحوم',
      location: { latitude: 24.7136, longitude: 46.6753 },
      documents,
      ...overrides,
    };
  }

  /**
   * A customer's pending application, its body changed by `overrides`: the customer
   * and the application's id.
   */
  async pendingApplication(
    label = 'applicant',
    overrides: Record<string, unknown> = {},
  ): Promise<{ customer: TestUser; applicationId: string }> {
    const customer = await this.customer(label);
    const res = await this.http
      .post('/v1/customer/vendor-applications')
      .set('Authorization', `Bearer ${customer.accessToken}`)
      .send(this.applicationBody(await this.documents(customer), overrides))
      .expect(201);
    return { customer, applicationId: (res.body as { id: string }).id };
  }

  /**
   * An approved vendor (its application changed by `overrides`): its id, its owner
   * signed in as a vendor, and the admin who
   * approved it.
   */
  async approvedVendor(
    label = 'vendor',
    overrides: Record<string, unknown> = {},
  ): Promise<{
    vendorId: string;
    owner: TestUser;
    admin: TestUser;
    applicationId: string;
  }> {
    const { customer, applicationId } = await this.pendingApplication(
      label,
      overrides,
    );
    const admin = await this.admin();
    const res = await this.http
      .post(`/v1/admin/vendor-applications/${applicationId}/approve`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ commissionBasisPoints: 1250 })
      .expect(200);
    const owner = await this.signIn(customer.phone, 'vendor');
    return {
      vendorId: (res.body as { id: string }).id,
      owner,
      admin,
      applicationId,
    };
  }

  /** Deletes everything the journeys created, children before parents. */
  async cleanUp(): Promise<void> {
    const prisma = this.app.get(PrismaService);
    const users = await prisma.user.findMany({
      where: { phone: { in: this.phones } },
      select: { id: true },
    });
    const userIds = [
      ...new Set([...users.map((user) => user.id), ...this.userIds]),
    ];
    const applications = await prisma.vendorApplication.findMany({
      where: { applicantId: { in: userIds } },
      select: { id: true },
    });
    const applicationIds = applications.map((application) => application.id);
    const vendors = await prisma.vendor.findMany({
      where: { applicationId: { in: applicationIds } },
      select: { id: true },
    });
    const vendorIds = vendors.map((vendor) => vendor.id);
    await prisma.userAccess.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.vendorCommissionChange.deleteMany({
      where: { vendorId: { in: vendorIds } },
    });
    await prisma.vendor.deleteMany({ where: { id: { in: vendorIds } } });
    await prisma.vendorApplication.deleteMany({
      where: { id: { in: applicationIds } },
    });
    await prisma.media.deleteMany({ where: { id: { in: this.mediaIds } } });
    await prisma.auditLog.deleteMany({
      where: { entityId: { in: [...applicationIds, ...vendorIds] } },
    });
    await prisma.otpChallenge.deleteMany({
      where: { phone: { in: this.phones } },
    });
    await prisma.auditLog.deleteMany({ where: { entityId: { in: userIds } } });
    // Consent history is insert-only and restricts its user's deletion.
    await prisma.consentRecord.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
}
