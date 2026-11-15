import { Injectable, type OnModuleInit } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { resolveRouteAudience } from '../auth/resolve-route-audience';
import { PUBLIC_ROUTE } from '../decorators/public-route.constants';
import { RouteWithoutAudienceError } from './route-without-audience.error';

/**
 * At startup, refuses to start when an endpoint is neither under an audience prefix
 * (`public`, `customer`, `vendor`, `kitchen`, `admin`) nor marked `@Public()`, naming
 * every such endpoint. The authentication guard would deny it on each call; this makes
 * the mistake visible before the first request instead of when a client meets it.
 */
@Injectable()
export class RouteAudienceCheck implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit(): void {
    const unmarked: string[] = [];
    for (const wrapper of this.discovery.getControllers()) {
      const controller = wrapper.metatype;
      if (typeof controller !== 'function') {
        continue;
      }
      if (
        this.reflector.get<boolean | undefined>(PUBLIC_ROUTE, controller) ===
          true ||
        resolveRouteAudience(
          this.reflector.get<unknown>(PATH_METADATA, controller),
        ) !== null
      ) {
        continue;
      }
      // Nest types a controller class's prototype as `any`: narrowed, not asserted (R21).
      const prototype: unknown = controller.prototype;
      if (typeof prototype !== 'object' || prototype === null) {
        continue;
      }
      for (const name of this.scanner.getAllMethodNames(prototype)) {
        const handler: unknown = Reflect.get(prototype, name);
        if (
          typeof handler === 'function' &&
          Reflect.getMetadata(PATH_METADATA, handler) !== undefined &&
          this.reflector.get<boolean | undefined>(PUBLIC_ROUTE, handler) !==
            true
        ) {
          unmarked.push(`${controller.name}.${name}`);
        }
      }
    }
    if (unmarked.length > 0) {
      throw new RouteWithoutAudienceError(unmarked);
    }
  }
}
