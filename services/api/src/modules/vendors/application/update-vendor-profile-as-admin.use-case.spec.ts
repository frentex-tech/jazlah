import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import { ADMIN, APPLICANT } from './vendors-test-data.fake';

const LOGO = '00000000-0000-4000-8000-0000000000e2';
const COVER = '00000000-0000-4000-8000-0000000000e3';
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

  it('sets the cover, contact details, VAT number and city, audited by field name', async () => {
    const { kit, vendor } = await platformVendor();
    kit.media.add({
      id: COVER,
      ownerId: ADMIN,
      purpose: 'vendor.cover',
      isReady: true,
    });

    const result = await kit.updateProfileAsAdmin.execute({
      vendorId: vendor.id,
      actorId: ADMIN,
      changes: {
        coverMediaId: COVER,
        contactPhone: '+966112345678',
        contactEmail: 'contact@example.com',
        vatNumber: '310123456700003',
        city: 'جدة',
      },
    });

    expect(result.vendor).toMatchObject({
      coverMediaId: COVER,
      contactPhone: '+966112345678',
      contactEmail: 'contact@example.com',
      vatNumber: '310123456700003',
      city: 'جدة',
    });
    expect(result.coverUrl).toBe(`https://cdn.example.invalid/${COVER}`);
    expect(kit.audit.rows).toMatchObject([
      {
        metadata: {
          fields: 'city,contactEmail,contactPhone,coverMediaId,vatNumber',
        },
      },
    ]);
  });

  it('refuses a logo file as the cover (another purpose) with MEDIA_NOT_FOUND', async () => {
    const { kit, vendor } = await platformVendor();
    kit.media.add({
      id: LOGO,
      ownerId: ADMIN,
      purpose: 'vendor.logo',
      isReady: true,
    });

    await expect(
      kit.updateProfileAsAdmin.execute({
        vendorId: vendor.id,
        actorId: ADMIN,
        changes: { coverMediaId: LOGO },
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_FOUND,
      details: { mediaId: LOGO },
    });
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
