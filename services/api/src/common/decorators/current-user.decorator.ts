import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user.type';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';

/**
 * The signed-in user of the request, as the access token describes them:
 * `me(@CurrentUser() user: AuthenticatedUser)`. Only on routes under an audience
 * prefix, where the authentication guard has run; anywhere else there is no user and it
 * throws INTERNAL_ERROR, because that is a programming error.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    if (user === undefined) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        cause: new Error(
          '@CurrentUser() used on a route without a signed-in user',
        ),
      });
    }
    return user;
  },
);
