import { randomInt } from 'node:crypto';

/**
 * A random 10-digit commercial registration number (Latin digits). Each vendor and
 * application in a run gets its own, since `vendors_commercial_registration_number_key`
 * allows one vendor per number and suites run in parallel.
 */
export function testRegistrationNumber(): string {
  return `7${String(randomInt(0, 1_000_000_000)).padStart(9, '0')}`;
}
