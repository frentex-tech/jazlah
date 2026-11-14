import { Controller, Get, Logger, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AccessTokenVerification } from '../auth/access-token-verification.type';
import type { AuthenticatedUser } from '../auth/authenticated-user.type';
import { Public } from '../decorators/public.decorator';
import { ErrorCode } from '../errors/error-code.enum';
import { AuthenticationGuard } from './authentication.guard';

@Controller('customer/orders')
class CustomerController {
  @Get()
  list(): void {}

  @Get('open')
  @Public()
  open(): void {}
}

@Controller('admin/users')
class AdminController {
  @Get()
  list(): void {}
}

@Controller('public/catalog')
class PublicController {
  @Get()
  list(): void {}
}

@Controller('reports')
class UnmarkedController {
  @Get()
  list(): void {}
}

@Public()
@Controller('health')
class MarkedController {
  @Get()
  check(): void {}
}

const CUSTOMER: AuthenticatedUser = {
  userId: 'user-1',
  sessionId: 'session-1',
  audience: 'customer',
  organisationId: null,
};

type Request = {
  headers: { authorization?: string };
  user?: AuthenticatedUser;
};

/** Runs the guard for `controller.method` with the given Authorization header. */
async function run(
  controller: new () => object,
  method: string,
  authorization: string | undefined,
  verification: AccessTokenVerification = { status: 'invalid' },
) {
  const verify = jest.fn((token: string) => {
    void token;
    return Promise.resolve(verification);
  });
  const request: Request = { headers: { authorization } };
  const context = {
    getHandler: () => (controller.prototype as Record<string, unknown>)[method],
    getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  const guard = new AuthenticationGuard(new Reflector(), { verify });
  const outcome = await guard.canActivate(context).then(
    (allowed) => ({ allowed }),
    (error: unknown) => ({
      code:
        typeof error === 'object' && error !== null && 'code' in error
          ? error.code
          : error,
    }),
  );
  return { outcome, request, verify };
}

describe('AuthenticationGuard', () => {
  let logError: jest.SpyInstance;

  beforeEach(() => {
    logError = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('public routes', () => {
    it('lets anyone through a controller marked @Public(), without reading the token', async () => {
      const { outcome, verify } = await run(
        MarkedController,
        'check',
        'Bearer whatever',
      );

      expect(outcome).toEqual({ allowed: true });
      expect(verify).not.toHaveBeenCalled();
    });

    it('lets anyone through the public prefix, without reading the token', async () => {
      const { outcome, verify, request } = await run(
        PublicController,
        'list',
        'Bearer whatever',
      );

      expect(outcome).toEqual({ allowed: true });
      expect(verify).not.toHaveBeenCalled();
      expect(request.user).toBeUndefined();
    });

    it('lets anyone through one endpoint marked @Public() in an audience controller', async () => {
      const { outcome } = await run(CustomerController, 'open', undefined);

      expect(outcome).toEqual({ allowed: true });
    });
  });

  describe('audience routes', () => {
    it.each([
      ['no Authorization header', undefined],
      ['an empty header', ''],
      ['another scheme', 'Basic dXNlcjpwYXNz'],
      ['the scheme without a token', 'Bearer '],
      ['two tokens', 'Bearer one two'],
    ])(
      'refuses %s with UNAUTHORIZED, without verifying',
      async (_l, header) => {
        const { outcome, verify } = await run(
          CustomerController,
          'list',
          header,
        );

        expect(outcome).toEqual({ code: ErrorCode.UNAUTHORIZED });
        expect(verify).not.toHaveBeenCalled();
      },
    );

    it('refuses an invalid token with UNAUTHORIZED', async () => {
      const { outcome } = await run(CustomerController, 'list', 'Bearer bad', {
        status: 'invalid',
      });

      expect(outcome).toEqual({ code: ErrorCode.UNAUTHORIZED });
    });

    it('refuses an expired token with ACCESS_TOKEN_EXPIRED, so the client refreshes', async () => {
      const { outcome } = await run(CustomerController, 'list', 'Bearer old', {
        status: 'expired',
      });

      expect(outcome).toEqual({ code: ErrorCode.ACCESS_TOKEN_EXPIRED });
    });

    it('lets a token of the route’s audience through and attaches its user', async () => {
      const { outcome, request, verify } = await run(
        CustomerController,
        'list',
        'bearer the-token',
        { status: 'valid', user: CUSTOMER },
      );

      expect(outcome).toEqual({ allowed: true });
      expect(verify).toHaveBeenCalledWith('the-token');
      expect(request.user).toEqual(CUSTOMER);
    });

    it('refuses a valid token of another audience with FORBIDDEN and attaches nobody', async () => {
      const { outcome, request } = await run(
        AdminController,
        'list',
        'Bearer the-token',
        { status: 'valid', user: CUSTOMER },
      );

      expect(outcome).toEqual({ code: ErrorCode.FORBIDDEN });
      expect(request.user).toBeUndefined();
    });
  });

  describe('a route with no audience and no @Public()', () => {
    it('is denied without a token, and the log names it', async () => {
      const { outcome } = await run(UnmarkedController, 'list', undefined);

      expect(outcome).toEqual({ code: ErrorCode.FORBIDDEN });
      expect(logError).toHaveBeenCalledWith(
        { controller: 'UnmarkedController', handler: 'list' },
        expect.stringContaining('no audience prefix'),
      );
    });

    it('is denied even with a valid token', async () => {
      const { outcome, verify } = await run(
        UnmarkedController,
        'list',
        'Bearer the-token',
        { status: 'valid', user: CUSTOMER },
      );

      expect(outcome).toEqual({ code: ErrorCode.FORBIDDEN });
      expect(verify).not.toHaveBeenCalled();
    });
  });
});
