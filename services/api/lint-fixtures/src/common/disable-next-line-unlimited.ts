// lint-rule: R12 violates
export function shout(text: string): void {
  // eslint-disable-next-line -- no rule named
  console.log(text);
}
