import { PRISMA_MESSAGE_OMITTED } from './prisma-error-logging.constants';
import { serializeError } from './serialize-error';

describe('serializeError', () => {
  it('keeps name, message, code, stack and cause, and drops every other property', () => {
    const cause = Object.assign(new Error('inner'), { secret: 'x' });
    const error = Object.assign(new TypeError('outer', { cause }), {
      code: 'E_OUTER',
      command: { args: ['AUTH', 'pw'] },
      meta: { detail: 'row' },
    });
    const serialized = serializeError(error);
    expect(Object.keys(serialized).sort()).toEqual([
      'cause',
      'code',
      'message',
      'stack',
      'type',
    ]);
    expect(serialized).toMatchObject({
      type: 'TypeError',
      message: 'outer',
      code: 'E_OUTER',
      cause: { type: 'Error', message: 'inner' },
    });
    expect(serialized.cause).not.toHaveProperty('secret');
  });

  it('reads the original error from the output of pino standard serializer (raw)', () => {
    const original = Object.assign(new Error('boom'), { leaked: 'no' });
    const standard = { type: 'Error', message: 'boom', leaked: 'no' };
    Object.defineProperty(standard, 'raw', { value: original });
    expect(serializeError(standard)).not.toHaveProperty('leaked');
    expect(serializeError(standard)).toMatchObject({ message: 'boom' });
  });

  it('describes a thrown value that is not an Error', () => {
    expect(serializeError('a string')).toEqual({
      type: 'string',
      message: 'a string',
    });
  });

  it('stops following causes after five levels', () => {
    let error = new Error('level 0');
    for (let level = 1; level <= 8; level += 1) {
      error = new Error(`level ${level}`, { cause: error });
    }
    let depth = 0;
    for (let current = serializeError(error); current.cause; depth += 1) {
      current = current.cause;
    }
    expect(depth).toBe(5);
  });

  describe('Prisma errors', () => {
    /** An error shaped like Prisma's, named as Prisma names its classes. */
    function prismaError(name: string, message: string, extra: object = {}) {
      const error = Object.assign(new Error(message), extra);
      error.name = name;
      error.stack = [
        `${name}: ${message}`,
        '    at query (client.ts:1:1)',
        '    at run (repo.ts:2:2)',
      ].join('\n');
      return error;
    }

    it('replaces the message, which can hold query values, and keeps name, code and model', () => {
      const error = prismaError(
        'PrismaClientKnownRequestError',
        'Unique constraint failed on phone +966500000123',
        { code: 'P2002', meta: { modelName: 'User', target: ['phone'] } },
      );
      const serialized = serializeError(error);
      expect(serialized).toMatchObject({
        type: 'PrismaClientKnownRequestError',
        code: 'P2002',
        model: 'User',
        message: PRISMA_MESSAGE_OMITTED,
      });
      expect(JSON.stringify(serialized)).not.toContain('+966500000123');
    });

    it('keeps only the stack frames, since a stack starts with the message', () => {
      const serialized = serializeError(
        prismaError(
          'PrismaClientValidationError',
          'Argument phone: +966500000123',
        ),
      );
      expect(serialized.stack).toBe(
        ['    at query (client.ts:1:1)', '    at run (repo.ts:2:2)'].join('\n'),
      );
      expect(serialized).not.toHaveProperty('model');
    });

    it('applies to a Prisma error found as a cause', () => {
      const cause = prismaError(
        'PrismaClientUnknownRequestError',
        'detail: Failing row contains (+966500000123)',
      );
      const serialized = serializeError(new Error('outer', { cause }));
      expect(JSON.stringify(serialized)).not.toContain('+966500000123');
      expect(serialized.cause?.message).toBe(PRISMA_MESSAGE_OMITTED);
    });
  });
});
