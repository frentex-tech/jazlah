import { Controller, Get, Post } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Public } from '../decorators/public.decorator';
import { RouteAudienceCheck } from './route-audience.check';
import { RouteWithoutAudienceError } from './route-without-audience.error';

@Controller('customer/orders')
class AudienceController {
  @Get()
  list(): void {}
}

@Controller('public/catalog')
class PublicPrefixController {
  @Get()
  list(): void {}
}

@Public()
@Controller('health')
class MarkedController {
  @Get()
  check(): void {}
}

@Controller('webhooks/payments')
class EachEndpointMarkedController {
  @Post('geidea')
  @Public()
  receive(): void {}
}

@Controller('reports')
class UnmarkedController {
  @Get()
  list(): void {}

  @Get('open')
  @Public()
  open(): void {}

  helper(): void {}
}

/** Starts a Nest application with the check and the given controllers. */
async function start(...controllers: (new () => object)[]): Promise<void> {
  const moduleRef = await Test.createTestingModule({
    imports: [DiscoveryModule],
    controllers,
    providers: [RouteAudienceCheck],
  }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  try {
    await app.init();
  } finally {
    await app.close();
  }
}

describe('RouteAudienceCheck', () => {
  it('starts when every endpoint has an audience prefix or @Public()', async () => {
    await expect(
      start(
        AudienceController,
        PublicPrefixController,
        MarkedController,
        EachEndpointMarkedController,
      ),
    ).resolves.toBeUndefined();
  });

  it('refuses to start with an endpoint that has neither, naming only that endpoint', async () => {
    const error = await start(AudienceController, UnmarkedController).then(
      () => undefined,
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(RouteWithoutAudienceError);
    expect(error).toMatchObject({ endpoints: ['UnmarkedController.list'] });
  });
});
