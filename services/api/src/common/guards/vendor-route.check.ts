import {
  Inject,
  Injectable,
  Optional,
  type OnModuleInit,
} from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { resolveRouteAudience } from '../auth/resolve-route-audience';
import { VENDOR_STATUS_CHECKER } from '../auth/vendor-status-checker.constants';
import type { VendorStatusChecker } from '../auth/vendor-status-checker.interface';
import { PUBLIC_ROUTE } from '../decorators/public-route.constants';
import { VendorRouteMisconfiguredError } from './vendor-route-misconfigured.error';

/**
 * At startup, refuses to start when a route under `vendor/` could escape the
 * organisation status guard: one marked `@Public()` (on the controller or the
 * endpoint), or any vendor route at all while no VendorStatusChecker is bound. The guard
 * denies both on each call; this makes the mistake visible before the first request.
 */
@Injectable()
export class VendorRouteCheck implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
    @Optional()
    @Inject(VENDOR_STATUS_CHECKER)
    private readonly vendors?: VendorStatusChecker,
  ) {}

  onModuleInit(): void {
    const endpoints: string[] = [];
    const marked: string[] = [];
    for (const wrapper of this.discovery.getControllers()) {
      const controller = wrapper.metatype;
      if (
        typeof controller !== 'function' ||
        resolveRouteAudience(
          this.reflector.get<unknown>(PATH_METADATA, controller),
        ) !== 'vendor'
      ) {
        continue;
      }
      const controllerIsPublic =
        this.reflector.get<boolean | undefined>(PUBLIC_ROUTE, controller) ===
        true;
      // Nest types a controller class's prototype as `any`: narrowed, not asserted (R21).
      const prototype: unknown = controller.prototype;
      if (typeof prototype !== 'object' || prototype === null) {
        continue;
      }
      for (const name of this.scanner.getAllMethodNames(prototype)) {
        const handler: unknown = Reflect.get(prototype, name);
        if (
          typeof handler !== 'function' ||
          Reflect.getMetadata(PATH_METADATA, handler) === undefined
        ) {
          continue;
        }
        const endpoint = `${controller.name}.${name}`;
        endpoints.push(endpoint);
        if (
          controllerIsPublic ||
          this.reflector.get<boolean | undefined>(PUBLIC_ROUTE, handler) ===
            true
        ) {
          marked.push(endpoint);
        }
      }
    }
    const problems: string[] = [];
    if (marked.length > 0) {
      problems.push(
        `these vendor endpoints are marked @Public(), which a vendor route may never be: ${marked.join(', ')}`,
      );
    }
    if (endpoints.length > 0 && this.vendors === undefined) {
      problems.push(
        'no VendorStatusChecker is bound (VENDOR_STATUS_CHECKER, provided by the vendors module)',
      );
    }
    if (problems.length > 0) {
      throw new VendorRouteMisconfiguredError(problems);
    }
  }
}
