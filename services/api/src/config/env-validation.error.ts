/**
 * Raised at startup when the environment does not match the schema.
 * Its message names each offending variable and what was expected, never the value.
 */
export class EnvValidationError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(
      `Invalid environment configuration:\n${problems.map((p) => `  - ${p}`).join('\n')}`,
    );
    this.name = 'EnvValidationError';
  }
}
