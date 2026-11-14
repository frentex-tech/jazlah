import { AUDIENCES } from './audiences.constants';
import type { RouteAudience } from './route-audience.type';

const ROUTE_AUDIENCES: readonly string[] = ['public', ...AUDIENCES];

function isRouteAudience(segment: string): segment is RouteAudience {
  return ROUTE_AUDIENCES.includes(segment);
}

/** The first segment of a controller path, without leading slashes. */
function firstSegment(path: string): string {
  return path.replace(/^\/+/, '').split('/')[0] ?? '';
}

/**
 * The audience of a controller, from the path given to `@Controller(...)`: its first
 * segment when that is `public` or one of AUDIENCES (`customer/orders` is `customer`),
 * otherwise null (`health`, `publicity`). A controller with several paths has an
 * audience only when all of them agree. The global prefix (`/v1`) is not part of a
 * controller path.
 */
export function resolveRouteAudience(
  controllerPath: unknown,
): RouteAudience | null {
  const paths: readonly unknown[] = Array.isArray(controllerPath)
    ? controllerPath
    : [controllerPath];
  let audience: RouteAudience | null = null;
  for (const path of paths) {
    if (typeof path !== 'string') {
      return null;
    }
    const segment = firstSegment(path);
    if (
      !isRouteAudience(segment) ||
      (audience !== null && audience !== segment)
    ) {
      return null;
    }
    audience = segment;
  }
  return audience;
}
