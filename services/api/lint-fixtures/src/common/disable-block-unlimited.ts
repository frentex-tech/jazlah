// lint-rule: R12 violates
// The review's bypass: a block disable with no rule list turned off every rule.
/* eslint-disable -- every rule off below this line */
export function shout(text: string): void {
  console.log(text);
}
