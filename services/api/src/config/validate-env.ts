import { EnvValidationError } from './env-validation.error';
import { envSchema } from './env.schema';
import type { Env } from './env.type';

/**
 * STORAGE_PROVIDER=disabled reads no other storage variable, so they may be left unset.
 * These inert values fill them for the schema, which keeps them required for `s3`.
 */
const DISABLED_STORAGE_PLACEHOLDERS = {
  STORAGE_REGION: 'none',
  STORAGE_ACCESS_KEY_ID: 'none',
  STORAGE_SECRET_ACCESS_KEY: 'none',
  STORAGE_PUBLIC_BUCKET: 'storage-disabled-public',
  STORAGE_PRIVATE_BUCKET: 'storage-disabled-private',
  STORAGE_PUBLIC_BASE_URL: 'https://storage-disabled.invalid',
};

/**
 * Validates raw environment variables against the schema.
 * Throws EnvValidationError naming every offending variable. Zod's issue messages
 * describe what was expected and do not repeat the input, so no value is printed.
 */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(
    raw.STORAGE_PROVIDER === 'disabled'
      ? { ...DISABLED_STORAGE_PLACEHOLDERS, ...raw }
      : raw,
  );
  if (result.success) {
    return result.data;
  }
  const problems = result.error.issues.map(
    (issue) => `${issue.path.map(String).join('.')}: ${issue.message}`,
  );
  throw new EnvValidationError(problems);
}
