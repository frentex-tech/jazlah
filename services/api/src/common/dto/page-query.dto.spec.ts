import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { encodePageCursor } from '../pagination/encode-page-cursor';
import { toPageRequest } from '../pagination/to-page-request';
import { PageQueryDto } from './page-query.dto';

const ID = '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b';
const AT = new Date('2026-11-15T10:00:00.000Z');

describe('PageQueryDto', () => {
  async function check(query: Record<string, unknown>) {
    const dto = plainToInstance(PageQueryDto, query);
    return { dto, errors: await validate(dto) };
  }

  it('defaults to the first page of 20', async () => {
    const { dto, errors } = await check({});

    expect(errors).toEqual([]);
    expect(toPageRequest(dto)).toEqual({ cursor: null, limit: 20 });
  });

  it('reads a cursor and a limit from the query string', async () => {
    const cursor = encodePageCursor({ createdAt: AT, id: ID });
    const { dto, errors } = await check({ cursor, limit: '50' });

    expect(errors).toEqual([]);
    expect(toPageRequest(dto)).toEqual({
      cursor: { createdAt: AT, id: ID },
      limit: 50,
    });
  });

  it.each([
    ['a limit of 0', { limit: '0' }, 'limit'],
    ['a limit of 51', { limit: '51' }, 'limit'],
    ['a fractional limit', { limit: '2.5' }, 'limit'],
    ['a foreign cursor', { cursor: 'abc' }, 'cursor'],
  ])('refuses %s', async (_label, query, field) => {
    const { errors } = await check(query);

    expect(errors.map((error) => error.property)).toEqual([field]);
  });
});
