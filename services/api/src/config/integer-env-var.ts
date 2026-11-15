import { z } from 'zod';

/**
 * An environment variable holding a whole number from `min` to `max`, with a default
 * (`fallback`), or without one when `fallback` is left out (add `.optional()` or the
 * variable is required). Every failure gives the same message, which states the range
 * and never the value.
 */
export function integerEnvVar(min: number, max: number): z.ZodNumber;
export function integerEnvVar(
  min: number,
  max: number,
  fallback: number,
): z.ZodDefault<z.ZodNumber>;
export function integerEnvVar(min: number, max: number, fallback?: number) {
  const error = `expected an integer from ${min} to ${max}`;
  const schema = z.coerce
    .number({ error })
    .int({ error })
    .min(min, { error })
    .max(max, { error });
  return fallback === undefined ? schema : schema.default(fallback);
}
