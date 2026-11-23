import { buildVendorsUseCases } from './vendors-use-cases.fake';
import {
  ADMIN,
  OTHER_CUSTOMER,
  applicationInput,
  submitted,
} from './vendors-test-data.fake';

describe('ListVendorApplicationsUseCase', () => {
  it('lists newest first, by status, one page after another', async () => {
    const kit = buildVendorsUseCases();
    const first = await submitted(kit);
    const second = await kit.submitApplication.execute(
      applicationInput(kit, { applicantId: OTHER_CUSTOMER }),
    );
    await kit.rejectApplication.execute({
      applicationId: first.id,
      reviewerId: ADMIN,
      reason: 'r',
    });

    const page1 = await kit.listApplications.execute(
      {},
      { cursor: null, limit: 1 },
    );
    const page2 = await kit.listApplications.execute(
      {},
      { cursor: page1.nextCursor, limit: 1 },
    );
    const pending = await kit.listApplications.execute(
      { status: 'pending' },
      { cursor: null, limit: 20 },
    );

    expect(page1.items.map((a) => a.id)).toEqual([second.id]);
    expect(page2.items.map((a) => a.id)).toEqual([first.id]);
    expect(page2.nextCursor).toBeNull();
    expect(pending.items.map((a) => a.id)).toEqual([second.id]);
  });

  it('narrows by search on either name or the CR number, with the status', async () => {
    const kit = buildVendorsUseCases();
    const application = await submitted(kit);
    const page = { cursor: null, limit: 20 };

    const byName = await kit.listApplications.execute({ q: 'NOKHBA' }, page);
    const byNumber = await kit.listApplications.execute(
      { q: '1010123456', status: 'pending' },
      page,
    );
    const rejected = await kit.listApplications.execute(
      { q: 'nokhba', status: 'rejected' },
      page,
    );

    expect(byName.items.map((a) => a.id)).toEqual([application.id]);
    expect(byNumber.items.map((a) => a.id)).toEqual([application.id]);
    expect(rejected.items).toEqual([]);
  });
});
