import { REQUEST_ID_MAX_LENGTH } from './request-id.constants';
import { resolveRequestId } from './resolve-request-id';

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('resolveRequestId', () => {
  it.each(['abc-123', 'req_1.2:3', 'A'.repeat(REQUEST_ID_MAX_LENGTH)])(
    'keeps a safe id %p',
    (id) => {
      expect(resolveRequestId(id)).toBe(id);
    },
  );

  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['too long', 'A'.repeat(REQUEST_ID_MAX_LENGTH + 1)],
    ['with spaces', 'abc def'],
    ['with markup', '<script>'],
    ['with a newline', 'abc\nINFO forged line'],
    ['repeated header', ['a', 'b']],
  ])('replaces an id that is %s with a UUID', (_label, id) => {
    expect(resolveRequestId(id)).toMatch(UUID);
  });
});
