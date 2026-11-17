/**
 * The fixed moment seeded timestamps count from (creation, review, publication): the
 * same on every run, so lists ordered by time come out the same, and in the past, so
 * nothing seeded looks newer than what a developer creates afterwards.
 */
export const SEED_EPOCH = new Date('2026-11-01T06:00:00.000Z');
