import {
  Inject,
  Injectable,
  Logger,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { ACCESS_TOKEN_VERIFIER } from '../auth/access-token-verifier.constants';
import type { AccessTokenVerifier } from '../auth/access-token-verifier.interface';
import type { AuthenticatedUser } from '../auth/authenticated-user.type';
import { resolveRouteAudience } from '../auth/resolve-route-audience';
import { PUBLIC_ROUTE } from '../decorators/public-route.constants';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';

const BEARER = /^Bearer +([^\s]+)$/i;

/**
 * The global authentication guard. Who may call a route is decided by the route, not
 * by the request:
 *
 * 1. `@Public()` on the handler or the controller: anyone. The Authorization header is
 *    not read.
 * 2. Otherwise the audience is the first segment of the controller's path
 *    (resolveRouteAudience; the matched route's own path, never the URL):
 *    - `public`: anyone, as above.
 *    - `customer`, `vendor`, `kitchen`, `admin`: a valid bearer access token
 *      (UNAUTHORIZED 401 without one, ACCESS_TOKEN_EXPIRED 401 when it has expired, so
 *      the client refreshes) whose single audience is this one (FORBIDDEN 403
 *      otherwise: an admin signed in to the customer app has no admin power). The user
 *      is attached to the request for `@CurrentUser()`.
 *    - anything else: denied with FORBIDDEN and an error log naming the controller.
 *      RouteAudienceCheck refuses to start with such a route, so this is a second line.
 *
 * It trusts the token alone and reads neither the database nor Redis: a signed-out,
 * disabled or deactivated user keeps access until the token expires
 * (AUTH_ACCESS_TOKEN_TTL_SECONDS; DECISIONS.md).
 *
 * Registered as APP_GUARD by the auth module, which is imported after RateLimitModule,
 * so it runs after the rate limits and failed tokens are counted (`http.md`,
 * "Guard order").
 */
@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(ACCESS_TOKEN_VERIFIER)
    private readonly tokens: AccessTokenVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const controller = context.getClass();
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      PUBLIC_ROUTE,
      [handler, controller],
    );
    if (isPublic === true) {
      return true;
    }
    const audience = resolveRouteAudience(
      this.reflector.get<unknown>(PATH_METADATA, controller),
    );
    if (audience === 'public') {
      return true;
    }
    if (audience === null) {
      this.logger.error(
        { controller: controller.name, handler: handler.name },
        'Route denied: it has no audience prefix and is not marked @Public()',
      );
      throw new AppError(ErrorCode.FORBIDDEN);
    }
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    }>();
    const token = BEARER.exec(request.headers.authorization ?? '')?.[1];
    if (token === undefined) {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }
    const verification = await this.tokens.verify(token);
    if (verification.status === 'expired') {
      throw new AppError(ErrorCode.ACCESS_TOKEN_EXPIRED);
    }
    if (verification.status === 'invalid') {
      throw new AppError(ErrorCode.UNAUTHORIZED);
    }
    if (verification.user.audience !== audience) {
      throw new AppError(ErrorCode.FORBIDDEN);
    }
    request.user = verification.user;
    return true;
  }
}
