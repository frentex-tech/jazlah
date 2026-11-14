// lint-rule: R13-floating-promise conforms
export async function fire(): Promise<number> {
  const value = await Promise.resolve(1);
  return value;
}
