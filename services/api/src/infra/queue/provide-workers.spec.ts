import {
  Inject,
  Injectable,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { queueConfig } from '@config/queue.config';
import { provideWorkers } from './provide-workers';

@Injectable()
class Dependency {}

/** Stands in for a processor or a scheduler: a dependency and a lifecycle hook. */
@Injectable()
class TestWorker implements OnApplicationBootstrap {
  started = false;

  constructor(@Inject(Dependency) readonly dependency: Dependency) {}

  onApplicationBootstrap(): void {
    this.started = true;
  }
}

describe('provideWorkers', () => {
  let moduleRef: TestingModule;

  async function start(workersEnabled: boolean): Promise<unknown> {
    moduleRef = await Test.createTestingModule({
      providers: [
        Dependency,
        { provide: queueConfig.KEY, useValue: { workersEnabled } },
        ...provideWorkers(TestWorker),
      ],
    }).compile();
    await moduleRef.init();
    return moduleRef.get(TestWorker);
  }

  afterEach(async () => {
    await moduleRef.close();
  });

  it('creates each worker with its dependencies and runs its hooks when workers are enabled', async () => {
    const worker = await start(true);

    expect(worker).toBeInstanceOf(TestWorker);
    expect((worker as TestWorker).dependency).toBe(moduleRef.get(Dependency));
    expect((worker as TestWorker).started).toBe(true);
  });

  it('provides an inert object, with no hooks run, when workers are disabled', async () => {
    const worker = await start(false);

    expect(worker).not.toBeInstanceOf(TestWorker);
    expect(worker).toEqual({});
    expect(Object.isFrozen(worker)).toBe(true);
  });
});
