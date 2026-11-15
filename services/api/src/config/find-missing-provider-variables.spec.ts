import { findMissingProviderVariables } from './find-missing-provider-variables';

// A provider table like SMS_PROVIDER_VARIABLES, with providers that need configuration
// (the log provider, the only real one so far, needs none).
const VARIABLES = {
  first: ['FIRST_API_KEY', 'SHARED_SENDER'],
  second: ['SECOND_API_KEY', 'SHARED_SENDER'],
  none: [],
} as const;

describe('findMissingProviderVariables', () => {
  it('finds nothing when every listed provider is configured', () => {
    expect(
      findMissingProviderVariables(['first', 'none'], VARIABLES, {
        FIRST_API_KEY: 'x',
        SHARED_SENDER: 'y',
      }),
    ).toEqual([]);
  });

  it('names each missing variable once, with the first provider needing it', () => {
    expect(
      findMissingProviderVariables(['first', 'second'], VARIABLES, {
        FIRST_API_KEY: 'x',
        SECOND_API_KEY: '',
      }),
    ).toEqual([
      { provider: 'first', variable: 'SHARED_SENDER' },
      { provider: 'second', variable: 'SECOND_API_KEY' },
    ]);
  });

  it('ignores the variables of providers not listed', () => {
    expect(findMissingProviderVariables(['none'], VARIABLES, {})).toEqual([]);
  });
});
