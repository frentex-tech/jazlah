import { Injectable, OnModuleInit } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import {
  RATE_LIMIT_POLICY,
  SKIP_RATE_LIMIT,
} from '@common/decorators/rate-limit.constants';
import type { RateLimitPolicy } from '@common/decorators/rate-limit-policy.type';
import { checkRateLimitPolicies } from './check-rate-limit-policies';
import type { RateLimitedEndpoint } from './rate-limited-endpoint.type';

/**
 * At startup, reads the rate limit decorators of every route handler of every
 * controller and fails the startup when they contradict each other
 * (checkRateLimitPolicies).
 */
@Injectable()
export class RateLimitPolicyCheck implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit(): void {
    const endpoints: RateLimitedEndpoint[] = [];
    for (const wrapper of this.discovery.getControllers()) {
      const controller = wrapper.metatype;
      if (typeof controller !== 'function') {
        continue;
      }
      // Nest types a controller class's prototype as `any`: narrowed, not asserted (R21).
      const prototype: unknown = controller.prototype;
      if (typeof prototype !== 'object' || prototype === null) {
        continue;
      }
      const classPolicy = this.reflector.get<RateLimitPolicy | undefined>(
        RATE_LIMIT_POLICY,
        controller,
      );
      const classSkipped =
        this.reflector.get<boolean | undefined>(SKIP_RATE_LIMIT, controller) ===
        true;
      for (const name of this.scanner.getAllMethodNames(prototype)) {
        const handler: unknown = Reflect.get(prototype, name);
        if (
          typeof handler !== 'function' ||
          Reflect.getMetadata(PATH_METADATA, handler) === undefined
        ) {
          continue;
        }
        endpoints.push({
          endpoint: `${controller.name}.${name}`,
          methodPolicy: this.reflector.get<RateLimitPolicy | undefined>(
            RATE_LIMIT_POLICY,
            handler,
          ),
          classPolicy,
          classSkipped,
        });
      }
    }
    checkRateLimitPolicies(endpoints);
  }
}
