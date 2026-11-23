import { createHash } from 'node:crypto';

/**
 * The client address of the running test: an IPv6 address in the documentation range
 * (2001:db8::/32) derived from the test file and the test's name, so every test, and
 * every suite outside its tests (beforeAll), has its own address and therefore its own
 * rate limit counters, whatever runs beside it. Deterministic: the same test gets the
 * same address in every run (the per-run REDIS_KEY_PREFIX keeps runs apart). 96 bits of
 * hash make two tests sharing an address practically impossible.
 */
export function testClientAddress(): string {
  const { testPath, currentTestName } = expect.getState();
  const hash = createHash('sha256')
    .update(`${testPath ?? ''}\0${currentTestName ?? ''}`)
    .digest('hex');
  const groups = Array.from({ length: 6 }, (_, i) =>
    hash.slice(i * 4, i * 4 + 4),
  );
  return ['2001', 'db8', ...groups].join(':');
}
