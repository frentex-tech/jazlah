import { productionRefusal } from './production-refusal';

describe('productionRefusal', () => {
  it('refuses production with a message naming NODE_ENV', () => {
    expect(productionRefusal('production')).toMatch(/NODE_ENV is production/);
  });

  it.each(['development', 'test'] as const)('allows %s', (nodeEnv) => {
    expect(productionRefusal(nodeEnv)).toBeNull();
  });
});
