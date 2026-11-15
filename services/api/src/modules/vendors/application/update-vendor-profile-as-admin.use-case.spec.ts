import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, APPLICANT } from './vendors-test-data.fake';

const LOGO = '00000000-0000-4000-8000-0000000000e2';
const UNKNOWN = '00000000-0000-4000-8000-0000000000ff';

describe('UpdateVendorProfileAsAdminUseCase', () => {
  async function platformVendor() {
    const kit = buildVendorsUseCases();
    const { vendor } = await kit.createPlatformVendor.execute();
    kit.audit.rows = [];
    return { kit, vendor };
  }

  it("sets the platform vendor's logo and description with the admin's upload, audited", async () => {
    const { kit, vendor } = await platformVendor();
    kit.media.add({
      id: LOGO,
      ownerId: ADMIN,
      purpose: 'vendor.logo',
      isReady: true,
    });

    const result = await kit.updateProfileAsAdmin.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      changes: { logoMediaId: LOGO, descriptionEn: 'Our own cuts' },
    });

    expect(result.vendor).toMatchObject({
      id: vendor.id,
      logoMediaId: LOGO,
      description: { ar: null, en: 'Our own cuts' },
    });
    expect(result.logoUrl).toBe(`https://cdn.example.invalid/${LOGO}`);
    expect(kit.audit.rows).toEqual([
      {
        actorId: ADMIN,
        action: 'vendors.vendor.profile_updated',
        entity: 'vendor',
        entityId: vendor.id,
        metadata: { fields: 'descriptionEn,logoMediaId' },
      },
    ]);
  });

  it('refuses a logo the admin did not upload as MEDIA_NOT_FOUND and an unconfirmed one as MEDIA_NOT_READY, changing nothing', async () => {
    const { kit, vendor } = await platformVendor();
    const attempt = () =>
      kit.updateProfileAsAdmin.execute({
        vendorId: vendor.id,
        actorId: ADMIN,
        changes: { logoMediaId: LOGO },
      });

    kit.media.add({
      id: LOGO,
      ownerId: APPLICANT,
      purpose: 'vendor.logo',
      isReady: true,
    });
    await expect(attempt()).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_FOUND,
    });
    kit.media.add({
      id: LOGO,
      ownerId: ADMIN,
      purpose: 'vendor.logo',
      isReady: false,
    });
    await expect(attempt()).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_READY,
    });

    expect((await kit.vendors.findById(vendor.id))?.logoMediaId).toBeNull();
    expect(kit.audit.rows).toEqual([]);
  });

  it('answers NOT_FOUND for an unknown vendor, writing no audit entry', async () => {
    const kit = buildVendorsUseCases();

    await expect(
      kit.updateProfileAsAdmin.execute({
        vendorId: UNKNOWN,
        actorId: ADMIN,
        changes: { descriptionAr: 'x' },
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    expect(kit.audit.rows).toEqual([]);
  });

  it('changes and records nothing for an empty body', async () => {
    const { kit, vendor } = await platformVendor();

    const result = await kit.updateProfileAsAdmin.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      changes: {},
    });

    expect(result.vendor.id).toBe(vendor.id);
    expect(kit.audit.rows).toEqual([]);
  });
});
