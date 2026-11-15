import { createHash } from 'node:crypto';

/**
 * A fictitious Saudi mobile number (E.164) of the running test, derived from the test
 * file, the test's name and `label`, so every test has its own phones: its own
 * verification challenges, per-phone rate limit counters and user rows, whatever runs
 * beside it. Deterministic, like testClientAddress.
 */
export function testPhone(label = ''): string {
  const { testPath, currentTestName } = expect.getState();
  const hash = createHash('sha256')
    .update(`${testPath ?? ''}\0${currentTestName ?? ''}\0${label}`)
    .digest();
  const digits = String(hash.readUInt32BE(0) % 100_000_000).padStart(8, '0');
  return `+9665${digits}`;
}
