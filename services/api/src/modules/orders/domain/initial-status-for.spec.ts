import { initialStatusFor } from './initial-status-for';

describe('initialStatusFor', () => {
  it.each([
    ['cod', 'new'],
    ['wallet', 'new'],
    ['mada', 'pending_payment'],
    ['card', 'pending_payment'],
    ['applepay', 'pending_payment'],
  ] as const)('starts a %s order as %s', (method, status) => {
    expect(initialStatusFor(method)).toBe(status);
  });
});
