import { isModuleResolvable } from './is-module-resolvable';

describe('isModuleResolvable', () => {
  it('is true for an installed package', () => {
    expect(isModuleResolvable('pino')).toBe(true);
  });

  it('is false for a package that is not installed', () => {
    expect(isModuleResolvable('jazla-package-that-does-not-exist')).toBe(false);
  });
});
