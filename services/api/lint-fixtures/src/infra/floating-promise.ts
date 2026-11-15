// lint-rule: R13-floating-promise violates
export function fire(): void {
  Promise.resolve(1);
}
