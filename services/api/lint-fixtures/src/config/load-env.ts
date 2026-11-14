// lint-rule: R11 conforms
export function loadEnv(): string | undefined {
  return process.env.PORT;
}
