import {
  Inject,
  Injectable,
  Logger,
  Optional,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedUser } from '../auth/authenticated-user.type';
import { resolveRouteAudience } from '../auth/resolve-route-audience';
import { VENDOR_STATUS_CHECKER } from '../auth/vendor-status-checker.constants';
import type { VendorStatusChecker } from '../auth/vendor-status-checker.interface';
import { PUBLIC_ROUTE } from '../decorators/public-route.constants';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';

/**
 * The second global guard: on every route whose audience is `vendor`, the vendor the
 * signed-in user works for (the token's organisation) must not be suspended, or the
 * request gets 403 VENDOR_SUSPENDED. It asks the VendorStatusChecker the vendors module
 * binds, on each request, so a suspension takes effect at once. Other audiences pass
 * untouched.
 *
 * Nothing skips it: there is no decorator to turn it off. It denies (FORBIDDEN, with an
 * error log) a vendor route that reaches it without a signed-in vendor (a route marked
 * `@Public()`, which VendorRouteCheck refuses at startup) and every vendor route while
 * no checker is bound (which VendorRouteCheck also refuses).
 *
 * Registered as APP_GUARD by the auth module right after the authentication guard, so it
 * runs after authentication and after the rate limits (`http.md`, "Guard order").
 */
@Injectable()
export class OrganisationStatusGuard implements CanActivate {
  private readonly logger = new Logger(OrganisationStatusGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Optional()
    @Inject(VENDOR_STATUS_CHECKER)
    private readonly vendors?: VendorStatusChecker,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const controller = context.getClass();
    if (
      resolveRouteAudience(
        this.reflector.get<unknown>(PATH_METADATA, controller),
      ) !== 'vendor'
    ) {
      return true;
    }
    const handler = context.getHandler();
    const user = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>().user;
    const denial = this.misconfiguration(context, user);
    if (denial !== null) {
      this.logger.error(
        { controller: controller.name, handler: handler.name },
        `Vendor route denied: ${denial}`,
      );
      throw new AppError(ErrorCode.FORBIDDEN);
    }
    if (
      this.vendors !== undefined &&
      user?.organisationId != null &&
      (await this.vendors.isSuspended(user.organisationId))
    ) {
      throw new AppError(ErrorCode.VENDOR_SUSPENDED);
    }
    return true;
  }

  /** Why a vendor route cannot be checked, or null when it can. */
  private misconfiguration(
    context: ExecutionContext,
    user: AuthenticatedUser | undefined,
  ): string | null {
    if (
      this.reflector.getAllAndOverride<boolean | undefined>(PUBLIC_ROUTE, [
        context.getHandler(),
        context.getClass(),
      ]) === true
    ) {
      return 'it is marked @Public()';
    }
    if (this.vendors === undefined) {
      return 'no VendorStatusChecker is bound';
    }
    if (user?.audience !== 'vendor' || user.organisationId === null) {
      return 'no signed-in vendor reached it';
    }
    return null;
  }
}
