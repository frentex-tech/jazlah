import type { Env } from './env.type';
import { validateEnv } from './validate-env';

let loaded: Env | undefined;

/**
 * The validated environment, shared by every config namespace.
 *
 * The first call validates `process.env` and throws EnvValidationError if it is
 * invalid; every later call returns the same result. This is the only file in the
 * API that reads `process.env` (enforced by lint).
 *
 * `.env` files are loaded into `process.env` by ConfigModule before the namespaces
 * are built; `main.ts` waits for that and calls this before creating the app.
 */
export function loadEnv(): Env {
  loaded ??= validateEnv(process.env);
  return loaded;
}
