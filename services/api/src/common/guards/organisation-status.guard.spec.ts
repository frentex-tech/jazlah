import { Controller, Get, Logger, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedUser } from '../auth/authenticated-user.type';
import type { VendorStatusChecker } from '../auth/vendor-status-checker.interface';
import { Public } from '../decorators/public.decorator';
import { ErrorCode } from '../errors/error-code.enum';
import { OrganisationStatusGuard } from './organisation-status.guard';

const ACTIVE_VENDOR = '00000000-0000-4000-8000-00000000000a';
const SUSPENDED_VENDOR = '00000000-0000-4000-8000-00000000000b';

@Controller('vendor/profile')
class VendorController {
  @Get()
  read(): void {}

  @Get('open')
  @Public()
  open(): void {}
}

@Controller('customer/orders')
class CustomerController {
  @Get()
  list(): void {}
}

const vendorUser = (organisationId: string | null): AuthenticatedUser => ({
  userId: 'user-1',
  sessionId: 'session-1',
  audience: 'vendor',
  organisationId,
});

const CUSTOMER: AuthenticatedUser = {
  userId: 'user-2',
  sessionId: 'session-2',
  audience: 'customer',
  organisationId: null,
};

/** A checker that knows one suspended vendor, and records what it was asked. */
function checker(): VendorStatusChecker & { asked: string[] } {
  const asked: string[] = [];
  return {
    asked,
    isSuspended: (vendorId) => {
      asked.push(vendorId);
      return Promise.resolve(vendorId === SUSPENDED_VENDOR);
    },
  };
}

async function run(
  controller: new () => object,
  method: string,
  user: AuthenticatedUser | undefined,
  vendors: VendorStatusChecker | undefined,
): Promise<{ allowed: boolean } | { code: unknown }> {
  const context = {
    getHandler: () => (controller.prototype as Record<string, unknown>)[method],
    getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
  const guard = new OrganisationStatusGuard(new Reflector(), vendors);
  return guard.canActivate(context).then(
    (allowed) => ({ allowed }),
    (error: unknown) => ({
      code:
        typeof error === 'object' && error !== null && 'code' in error
          ? error.code
          : error,
    }),
  );
}

describe('OrganisationStatusGuard', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('lets an active vendor through, asking about its own organisation', async () => {
    const vendors = checker();

    await expect(
      run(VendorController, 'read', vendorUser(ACTIVE_VENDOR), vendors),
    ).resolves.toEqual({ allowed: true });
    expect(vendors.asked).toEqual([ACTIVE_VENDOR]);
  });

  it('refuses a suspended vendor with VENDOR_SUSPENDED', async () => {
    await expect(
      run(VendorController, 'read', vendorUser(SUSPENDED_VENDOR), checker()),
    ).resolves.toEqual({ code: ErrorCode.VENDOR_SUSPENDED });
  });

  it('leaves other audiences alone and asks nothing', async () => {
    const vendors = checker();

    await expect(
      run(CustomerController, 'list', CUSTOMER, vendors),
    ).resolves.toEqual({ allowed: true });
    await expect(
      run(CustomerController, 'list', CUSTOMER, undefined),
    ).resolves.toEqual({ allowed: true });
    expect(vendors.asked).toEqual([]);
  });

  it('denies every vendor route while no checker is bound', async () => {
    await expect(
      run(VendorController, 'read', vendorUser(ACTIVE_VENDOR), undefined),
    ).resolves.toEqual({ code: ErrorCode.FORBIDDEN });
  });

  it('denies a vendor route marked @Public(), even for an active vendor', async () => {
    await expect(
      run(VendorController, 'open', vendorUser(ACTIVE_VENDOR), checker()),
    ).resolves.toEqual({ code: ErrorCode.FORBIDDEN });
    await expect(
      run(VendorController, 'open', undefined, checker()),
    ).resolves.toEqual({ code: ErrorCode.FORBIDDEN });
  });

  it('denies a vendor route reached without a vendor organisation', async () => {
    await expect(
      run(VendorController, 'read', vendorUser(null), checker()),
    ).resolves.toEqual({ code: ErrorCode.FORBIDDEN });
    await expect(
      run(VendorController, 'read', CUSTOMER, checker()),
    ).resolves.toEqual({ code: ErrorCode.FORBIDDEN });
  });
});
