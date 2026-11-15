import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { HealthController } from './health.controller';
import type { ReadinessReport } from './readiness-report.type';
import { ReadinessService } from './readiness.service';

describe('HealthController', () => {
  let controller: HealthController;
  let report: ReadinessReport;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ReadinessService,
          useValue: { check: () => Promise.resolve(report) },
        },
      ],
    }).compile();

    controller = moduleRef.get<HealthController>(HealthController);
  });

  function fakeResponse() {
    const state = { status: 0 };
    const response = {
      status: (code: number) => {
        state.status = code;
        return response;
      },
    };
    return { state, response: response as unknown as Response };
  }

  it('reports status ok for liveness', () => {
    expect(controller.check()).toEqual({ status: 'ok' });
  });

  it('answers 200 with the checks when every dependency is up', async () => {
    report = { status: 'ok', checks: { database: 'up', redis: 'up' } };
    const { state, response } = fakeResponse();
    await expect(controller.ready(response)).resolves.toEqual(report);
    expect(state.status).toBe(200);
  });

  it('answers 503 naming the dependency that is down', async () => {
    report = {
      status: 'unavailable',
      checks: { database: 'up', redis: 'down' },
    };
    const { state, response } = fakeResponse();
    await expect(controller.ready(response)).resolves.toEqual(report);
    expect(state.status).toBe(503);
  });
});
