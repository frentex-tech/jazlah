import { EnvValidationError } from './env-validation.error';
import { envSchema } from './env.schema';
import type { Env } from './env.type';

/**
 * Validates raw environment variables against the schema.
 * Throws EnvValidationError naming every offending variable. Zod's issue messages
 * describe what was expected and do not repeat the input, so no value is printed.
 */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }
  const problems = result.error.issues.map(
    (issue) => `${issue.path.map(String).join('.')}: ${issue.message}`,
  );
  throw new EnvValidationError(problems);
}
