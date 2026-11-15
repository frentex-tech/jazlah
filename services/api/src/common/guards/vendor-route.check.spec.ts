import { Controller, Get, Post } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { VENDOR_STATUS_CHECKER } from '../auth/vendor-status-checker.constants';
import type { VendorStatusChecker } from '../auth/vendor-status-checker.interface';
import { Public } from '../decorators/public.decorator';
import { VendorRouteCheck } from './vendor-route.check';
import { VendorRouteMisconfiguredError } from './vendor-route-misconfigured.error';

@Controller('vendor/profile')
class VendorController {
  @Get()
  read(): void {}
}

@Controller('vendor/orders')
class PublicEndpointVendorController {
  @Get()
  list(): void {}

  @Post('open')
  @Public()
  open(): void {}
}

@Public()
@Controller('vendor/catalog')
class PublicVendorController {
  @Get()
  list(): void {}
}

@Controller('customer/orders')
class CustomerController {
  @Get()
  list(): void {}
}

const CHECKER: VendorStatusChecker = {
  isSuspended: () => Promise.resolve(false),
};

/** Starts a Nest application with the check, the controllers and, optionally, a checker. */
async function start(
  withChecker: boolean,
  ...controllers: (new () => object)[]
): Promise<void> {
  const moduleRef = await Test.createTestingModule({
    imports: [DiscoveryModule],
    controllers,
    providers: [
      VendorRouteCheck,
      ...(withChecker
        ? [{ provide: VENDOR_STATUS_CHECKER, useValue: CHECKER }]
        : []),
    ],
  }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  try {
    await app.init();
  } finally {
    await app.close();
  }
}

describe('VendorRouteCheck', () => {
  it('starts with vendor routes and a checker', async () => {
    await expect(
      start(true, VendorController, CustomerController),
    ).resolves.toBeUndefined();
  });

  it('starts without a checker when there is no vendor route', async () => {
    await expect(start(false, CustomerController)).resolves.toBeUndefined();
  });

  it('refuses to start with a vendor route and no checker', async () => {
    await expect(start(false, VendorController)).rejects.toThrow(
      new VendorRouteMisconfiguredError([
        'no VendorStatusChecker is bound (VENDOR_STATUS_CHECKER, provided by the vendors module)',
      ]),
    );
  });

  it('refuses to start with a vendor endpoint or controller marked @Public(), naming each', async () => {
    await expect(
      start(true, PublicEndpointVendorController, PublicVendorController),
    ).rejects.toThrow(
      new VendorRouteMisconfiguredError([
        'these vendor endpoints are marked @Public(), which a vendor route may never be: PublicEndpointVendorController.open, PublicVendorController.list',
      ]),
    );
  });
});
