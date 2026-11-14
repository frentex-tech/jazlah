import { SetMetadata } from '@nestjs/common';
import { PUBLIC_ROUTE } from './public-route.constants';

/**
 * Marks a controller or one endpoint as needing no sign-in, for routes outside the
 * audience prefixes: the health checks, an incoming webhook (which checks a signature
 * instead). Routes under `/v1/public/...` are public by their prefix and do not need
 * it. An endpoint with neither an audience prefix nor this decorator stops the
 * application from starting (RouteAudienceCheck): nothing becomes public, or
 * unreachable, by omission.
 */
export function Public(): MethodDecorator & ClassDecorator {
  return SetMetadata(PUBLIC_ROUTE, true);
}
