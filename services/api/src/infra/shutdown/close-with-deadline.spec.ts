import { ClosingResources } from './closing-resources';
import { closeWithDeadline } from './close-with-deadline';
import type { ShutdownLogger } from './shutdown-logger.type';

describe('closeWithDeadline', () => {
  let resources: ClosingResources;
  let logged: { level: string; fields: object; message: string }[];
  let logger: ShutdownLogger;
  let exitCodes: number[];

  beforeEach(() => {
    jest.useFakeTimers();
    resources = new ClosingResources();
    logged = [];
    logger = {
      log: (fields, message) => logged.push({ level: 'log', fields, message }),
      error: (fields, message) =>
        logged.push({ level: 'error', fields, message }),
    };
    exitCodes = [];
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const options = () => ({
    deadlineMs: 1_000,
    logger,
    exit: (code: number) => exitCodes.push(code),
    resources,
  });

  it('exits with code 1 and names the resource that never closes', async () => {
    const closing = closeWithDeadline(() => {
      resources.begin('database');
      resources.begin('stuck-probe');
      return new Promise<void>(() => {});
    }, options());
    void closing;
    await jest.advanceTimersByTimeAsync(999);
    expect(exitCodes).toEqual([]);

    await jest.advanceTimersByTimeAsync(1);

    expect(exitCodes).toEqual([1]);
    expect(logged).toEqual([
      {
        level: 'error',
        fields: {
          deadlineMs: 1_000,
          stillClosing: ['database', 'stuck-probe'],
        },
        message:
          'Shutdown deadline passed; exiting with resources still closing',
      },
    ]);
  });

  it('does not exit when the close finishes in time', async () => {
    await closeWithDeadline(async () => {
      const done = resources.begin('database');
      await Promise.resolve();
      done();
    }, options());

    expect(exitCodes).toEqual([]);
    expect(logged.map((line) => line.message)).toEqual(['Shutdown complete']);
    expect(resources.list()).toEqual([]);
  });

  it('exits with code 1 when the close throws, and not again at the deadline', async () => {
    await closeWithDeadline(
      () => Promise.reject(new Error('hook failed')),
      options(),
    );
    await jest.advanceTimersByTimeAsync(2_000);

    expect(exitCodes).toEqual([1]);
    expect(logged.map((line) => line.message)).toEqual(['Shutdown failed']);
  });
});
