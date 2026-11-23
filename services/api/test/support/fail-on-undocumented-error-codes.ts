import { undocumentedErrorCodes } from './documented-error-codes';

/**
 * A setup file of every e2e suite (`jest-e2e.json`): once the suite's tests have run,
 * it fails if any route answered with an error code its `openapi.json` operation does
 * not list. Fix the operation's `@ApiErrorResponses`, never this check.
 */
afterAll(() => {
  expect(undocumentedErrorCodes()).toEqual([]);
});
