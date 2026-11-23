// lint-rule: R9-unsafe-return violates
export function parse(text: string): { a: number } {
  return JSON.parse(text);
}
