// lint-rule: R9-any R9-unsafe-assignment R9-unsafe-member-access R9-unsafe-call R9-unsafe-return R9-unsafe-argument conforms
export function first(items: readonly string[]): string | undefined {
  return items[0];
}

export function parseCount(text: string): number {
  const data: unknown = JSON.parse(text);
  return typeof data === 'number' ? data : 0;
}
