import { randomUUID } from 'node:crypto';
import { RequestMethod, type INestApplication } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import type { App } from 'supertest/types';
import { resolveRouteAudience } from '@common/auth/resolve-route-audience';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { SMS_PORTS } from '@integrations/sms';
import { FakeSmsProvider } from '@integrations/sms/testing';
import { STORAGE_PORT } from '@integrations/storage';
import { FakeStorageProvider } from '@integrations/storage/testing';
import { createHttpApp } from './support/create-http-app';
import { VendorJourney } from './support/vendor-journey';

/** One registered route: its method and its path with every parameter filled in. */
type Route = Readonly<{ method: string; path: string }>;

const VERBS: Readonly<Partial<Record<RequestMethod, string>>> = {
  [RequestMethod.GET]: 'get',
  [RequestMethod.POST]: 'post',
  [RequestMethod.PUT]: 'put',
  [RequestMethod.PATCH]: 'patch',
  [RequestMethod.DELETE]: 'delete',
};

/** `/v1/<controller path>/<handler path>`, each `:param` replaced by a random UUID. */
function routePath(controllerPath: string, handlerPath: string): string {
  return `/v1/${[controllerPath, handlerPath]
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .filter((part) => part !== '')
    .join('/')}`.replace(/:[A-Za-z]+/g, () => randomUUID());
}

/** Every route the application registered under `vendor/`, read from Nest's metadata. */
function vendorRoutes(app: INestApplication<App>): Route[] {
  const discovery = app.get(DiscoveryService, { strict: false });
  const scanner = app.get(MetadataScanner, { strict: false });
  const routes: Route[] = [];
  for (const wrapper of discovery.getControllers()) {
    const controller = wrapper.metatype;
    if (typeof controller !== 'function') {
      continue;
    }
    const controllerPath: unknown = Reflect.getMetadata(
      PATH_METADATA,
      controller,
    );
    if (
      typeof controllerPath !== 'string' ||
      resolveRouteAudience(controllerPath) !== 'vendor'
    ) {
      continue;
    }
    const prototype: unknown = controller.prototype;
    if (typeof prototype !== 'object' || prototype === null) {
      continue;
    }
    for (const name of scanner.getAllMethodNames(prototype)) {
      const handler: unknown = Reflect.get(prototype, name);
      if (typeof handler !== 'function') {
        continue;
      }
      const handlerPath: unknown = Reflect.getMetadata(PATH_METADATA, handler);
      const method: unknown = Reflect.getMetadata(METHOD_METADATA, handler);
      if (typeof handlerPath !== 'string' || typeof method !== 'number') {
        continue;
      }
      const verb = VERBS[method as RequestMethod];
      if (verb === undefined) {
        throw new Error(`Unexpected method on ${controller.name}.${name}`);
      }
      routes.push({
        method: verb,
        path: routePath(controllerPath, handlerPath),
      });
    }
  }
  return routes;
}

/**
 * Every vendor route refuses a suspended vendor, found by walking the routes the
 * application registered: a new vendor endpoint is covered without being listed here.
 * The organisation status guard is what makes this pass; with it removed, every route
 * answers something else.
 */
describe('Vendor routes refuse a suspended vendor (e2e)', () => {
  let app: INestApplication<App>;
  let journey: VendorJourney;

  beforeAll(async () => {
    const sms = new FakeSmsProvider();
    const storage = new FakeStorageProvider();
    app = await createHttpApp({
      overrides: [
        { provide: SMS_PORTS, useValue: [sms] },
        { provide: STORAGE_PORT, useValue: storage },
      ],
    });
    journey = new VendorJourney(app, sms, storage);
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }
    await journey.cleanUp();
    await app.close();
  });

  it('answers 403 VENDOR_SUSPENDED on every registered vendor route', async () => {
    const { vendorId, owner, admin } = await journey.approvedVendor();
    await journey.http
      .post(`/v1/admin/vendors/${vendorId}/suspend`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ reason: 'r' })
      .expect(200);
    const routes = vendorRoutes(app);

    // Not vacuous: the routes known today are among those walked.
    expect(routes.map((route) => `${route.method} ${route.path}`)).toEqual(
      expect.arrayContaining([
        'get /v1/vendor/me',
        'post /v1/vendor/auth/logout-all',
        'get /v1/vendor/profile',
        'patch /v1/vendor/profile',
        'post /v1/vendor/media/uploads',
      ]),
    );
    expect(routes.some((route) => route.path.endsWith('/confirm'))).toBe(true);

    const answers = [];
    for (const route of routes) {
      const res = await journey.http[route.method as 'get'](route.path)
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({});
      answers.push({
        route: `${route.method} ${route.path}`,
        status: res.status,
        code: (res.body as ErrorResponseBody).code,
      });
    }

    expect(answers).toEqual(
      routes.map((route) => ({
        route: `${route.method} ${route.path}`,
        status: 403,
        code: 'VENDOR_SUSPENDED',
      })),
    );
  });
});
