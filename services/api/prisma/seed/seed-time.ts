import { SEED_EPOCH } from './seed-epoch.constants';

/** One hour, in milliseconds. */
const HOUR_MS = 3_600_000;

/** The seeded timestamp `hours` after SEED_EPOCH (a UTC instant; no calendar logic). */
export function seedTime(hours: number): Date {
  return new Date(SEED_EPOCH.getTime() + hours * HOUR_MS);
}
