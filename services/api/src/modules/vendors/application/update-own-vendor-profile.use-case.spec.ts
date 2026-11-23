import { ErrorCode } from '@common/errors/error-code.enum';
import { buildVendorsUseCases } from './vendors-use-cases.fake';
import {
  ADMIN,
  APPLICANT,
  OTHER_CUSTOMER,
  submitted,
} from './vendors-test-data.fake';

const LOGO = '00000000-0000-4000-8000-0000000000e1';
const COVER = '00000000-0000-4000-8000-0000000000e4';

describe('UpdateOwnVendorProfileUseCase', () => {
  async function ownVendor() {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    const vendor = await kit.approveApplication.execute({
      applicationId: application.id,
      reviewerId: ADMIN,
      commissionBasisPoints: 1000,
    });
    return { kit, vendor };
  }

  it('sets the logo and descriptions, leaving out what is not given', async () => {
    const { kit, vendor } = await ownVendor();
    kit.media.add({
      id: LOGO,
      ownerId: APPLICANT,
      purpose: 'vendor.logo',
      isReady: true,
    });

    const result = await kit.updateProfile.execute({
      vendorId: vendor.id,
      userId: APPLICANT,
      changes: { logoMediaId: LOGO, descriptionAr: 'لحوم طازجة' },
    });

    expect(result.vendor).toMatchObject({
      logoMediaId: LOGO,
      description: { ar: 'لحوم طازجة', en: null },
    });
    expect(result.logoUrl).toBe(`https://cdn.example.invalid/${LOGO}`);
  });

  it('clears the logo with null', async () => {
    const { kit, vendor } = await ownVendor();
    kit.media.add({
      id: LOGO,
      ownerId: APPLICANT,
      purpose: 'vendor.logo',
      isReady: true,
    });
    await kit.updateProfile.execute({
      vendorId: vendor.id,
      userId: APPLICANT,
      changes: { logoMediaId: LOGO },
    });

    const result = await kit.updateProfile.execute({
      vendorId: vendor.id,
      userId: APPLICANT,
      changes: { logoMediaId: null },
    });

    expect(result).toMatchObject({
      vendor: { logoMediaId: null },
      logoUrl: null,
    });
  });

  it("refuses another user's logo, a missing one and another purpose as MEDIA_NOT_FOUND, an unconfirmed one as MEDIA_NOT_READY", async () => {
    const { kit, vendor } = await ownVendor();
    const attempt = (logoMediaId: string) =>
      kit.updateProfile.execute({
        vendorId: vendor.id,
        userId: APPLICANT,
        changes: { logoMediaId },
      });

    kit.media.add({
      id: LOGO,
      ownerId: OTHER_CUSTOMER,
      purpose: 'vendor.logo',
      isReady: true,
    });
    await expect(attempt(LOGO)).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_FOUND,
    });
    await expect(
      attempt('00000000-0000-4000-8000-0000000000ff'),
    ).rejects.toMatchObject({ code: ErrorCode.MEDIA_NOT_FOUND });
    kit.media.add({
      id: LOGO,
      ownerId: APPLICANT,
      purpose: 'vendor.document',
      isReady: true,
    });
    await expect(attempt(LOGO)).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_FOUND,
    });
    kit.media.add({
      id: LOGO,
      ownerId: APPLICANT,
      purpose: 'vendor.logo',
      isReady: false,
    });
    await expect(attempt(LOGO)).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_READY,
    });
    expect((await kit.vendors.findById(vendor.id))?.logoMediaId).toBeNull();
  });

  it('sets the cover, contact details and VAT number, and clears them with null', async () => {
    const { kit, vendor } = await ownVendor();
    kit.media.add({
      id: COVER,
      ownerId: APPLICANT,
      purpose: 'vendor.cover',
      isReady: true,
    });

    const set = await kit.updateProfile.execute({
      vendorId: vendor.id,
      userId: APPLICANT,
      changes: {
        coverMediaId: COVER,
        contactPhone: '+966512345678',
        contactEmail: 'shop@example.com',
        vatNumber: '399999999900003',
      },
    });
    expect(set.vendor).toMatchObject({
      coverMediaId: COVER,
      contactPhone: '+966512345678',
      contactEmail: 'shop@example.com',
      vatNumber: '399999999900003',
      city: 'الرياض',
    });
    expect(set.coverUrl).toBe(`https://cdn.example.invalid/${COVER}`);

    const cleared = await kit.updateProfile.execute({
      vendorId: vendor.id,
      userId: APPLICANT,
      changes: {
        coverMediaId: null,
        contactPhone: null,
        contactEmail: null,
        vatNumber: null,
      },
    });
    expect(cleared).toMatchObject({
      vendor: {
        coverMediaId: null,
        contactPhone: null,
        contactEmail: null,
        vatNumber: null,
      },
      coverUrl: null,
    });
  });

  it('refuses an unconfirmed cover as MEDIA_NOT_READY, and a logo file as the cover as MEDIA_NOT_FOUND', async () => {
    const { kit, vendor } = await ownVendor();
    const attempt = () =>
      kit.updateProfile.execute({
        vendorId: vendor.id,
        userId: APPLICANT,
        changes: { coverMediaId: COVER },
      });

    kit.media.add({
      id: COVER,
      ownerId: APPLICANT,
      purpose: 'vendor.logo',
      isReady: true,
    });
    await expect(attempt()).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_FOUND,
    });
    kit.media.add({
      id: COVER,
      ownerId: APPLICANT,
      purpose: 'vendor.cover',
      isReady: false,
    });
    await expect(attempt()).rejects.toMatchObject({
      code: ErrorCode.MEDIA_NOT_READY,
    });
    expect((await kit.vendors.findById(vendor.id))?.coverMediaId).toBeNull();
  });

  it('answers NOT_FOUND for a vendor that does not exist', async () => {
    const kit = buildVendorsUseCases();

    await expect(
      kit.updateProfile.execute({
        vendorId: '00000000-0000-4000-8000-0000000000ff',
        userId: APPLICANT,
        changes: { descriptionEn: 'x' },
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });
});
