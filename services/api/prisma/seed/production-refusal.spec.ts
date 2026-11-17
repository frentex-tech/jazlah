import { productionRefusal } from './production-refusal';

describe('productionRefusal', () => {
  it.each([false, true])(
    'refuses production, even with --allow-staging (%p)',
    (allowStaging) => {
      expect(productionRefusal('production', allowStaging)).toMatch(
        /DEPLOYMENT_ENV is production/,
      );
    },
  );

  it('refuses staging without --allow-staging, naming the flag', () => {
    expect(productionRefusal('staging', false)).toMatch(
      /DEPLOYMENT_ENV is staging.*pnpm db:seed --allow-staging/,
    );
  });

  it('allows staging with --allow-staging', () => {
    expect(productionRefusal('staging', true)).toBeNull();
  });

  it.each([false, true])('allows development (%p)', (allowStaging) => {
    expect(productionRefusal('development', allowStaging)).toBeNull();
  });
});
