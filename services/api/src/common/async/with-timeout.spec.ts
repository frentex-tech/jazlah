import { TimeoutError } from './timeout.error';
import { withTimeout } from './with-timeout';

describe('withTimeout', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('resolves with the value when the work finishes in time', async () => {
    await expect(withTimeout(Promise.resolve('done'), 100)).resolves.toBe(
      'done',
    );
  });

  it('rejects with the work error when the work fails in time', async () => {
    await expect(
      withTimeout(Promise.reject(new Error('failed')), 100),
    ).rejects.toThrow('failed');
  });

  it('rejects with TimeoutError when the work takes too long', async () => {
    const never = new Promise<string>(() => undefined);
    const result = withTimeout(never, 100);
    const assertion = expect(result).rejects.toBeInstanceOf(TimeoutError);
    await jest.advanceTimersByTimeAsync(100);
    await assertion;
  });

  it('clears its timer when the work finishes first', async () => {
    await withTimeout(Promise.resolve(1), 100);
    expect(jest.getTimerCount()).toBe(0);
  });
});
