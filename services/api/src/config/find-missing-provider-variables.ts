/**
 * The variables the listed providers need but `env` does not set (undefined or empty),
 * in list order, each with the first provider that needs it. `variablesOf` gives each
 * provider's variables (SMS_PROVIDER_VARIABLES).
 */
export function findMissingProviderVariables<Name extends string>(
  providers: readonly Name[],
  variablesOf: Readonly<Record<Name, readonly string[]>>,
  env: Readonly<Record<string, unknown>>,
): readonly Readonly<{ provider: Name; variable: string }>[] {
  const missing: { provider: Name; variable: string }[] = [];
  for (const provider of providers) {
    for (const variable of variablesOf[provider]) {
      const value = env[variable];
      if (
        (value === undefined || value === '') &&
        !missing.some((entry) => entry.variable === variable)
      ) {
        missing.push({ provider, variable });
      }
    }
  }
  return missing;
}
