// lint-rule: R12 conforms
export function shout(text: string): void {
  // eslint-disable-next-line no-console -- this fixture writes to the console on purpose
  console.log(text);
}
