import { createHmac } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import type { AuthConfig } from '@config/auth-config.type';
import { FixedClock } from '../domain/fakes/fixed-clock.fake';
import { JwtAccessTokens } from './jwt-access-tokens';

/** Obviously not real secrets. */
const KEY_1 = { id: '1', secret: 'example-access-token-secret-0123456789' };
const KEY_2 = { id: '2', secret: 'example-second-secret-0123456789-abcdef' };

const USER: AuthenticatedUser = {
  userId: '6f1c0c53-3f0b-4d0a-9a6f-2f0f0f8f7a11',
  sessionId: '0b9f6a0e-58e5-4f6b-8e0a-5a1d3d0c2b10',
  audience: 'vendor',
  organisationId: '11111111-1111-4111-8111-111111111111',
};

type Keys = Pick<AuthConfig, 'accessTokenKey' | 'previousAccessTokenKey'>;

function build(keys: Keys, clock = new FixedClock('2026-11-14T09:00:00.000Z')) {
  return {
    clock,
    tokens: new JwtAccessTokens(new JwtService({}), clock, {
      ...keys,
      accessTokenTtlSeconds: 900,
    }),
  };
}

const ONLY_KEY_1: Keys = {
  accessTokenKey: KEY_1,
  previousAccessTokenKey: undefined,
};

function decode(part: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as Record<
    string,
    unknown
  >;
}

/** The HMAC hash each declared algorithm signs with. */
const HMAC_HASHES: Readonly<Record<string, string>> = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
};

/**
 * A token with the given header and payload, signed with `secret` and the HMAC hash its
 * header declares (HS256 for anything else, `none` included), so a token declaring
 * another algorithm carries a valid signature for it.
 */
function forge(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  secret: string,
): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const body = `${encode(header)}.${encode(payload)}`;
  const hash = HMAC_HASHES[String(header.alg)] ?? 'sha256';
  const signature = createHmac(hash, secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

const NOW_SECONDS = Date.parse('2026-11-14T09:00:00.000Z') / 1000;
const CLAIMS = {
  sub: USER.userId,
  sid: USER.sessionId,
  aud: USER.audience,
  org: USER.organisationId,
  iss: 'jazla-api',
  iat: NOW_SECONDS,
  exp: NOW_SECONDS + 900,
};
const HEADER = { alg: 'HS256', typ: 'JWT', kid: '1' };

describe('JwtAccessTokens', () => {
  it('signs a token that verifies back to the same user', async () => {
    const { tokens, clock } = build(ONLY_KEY_1);

    const token = await tokens.sign(USER, clock.now());

    expect(await tokens.verify(token)).toEqual({ status: 'valid', user: USER });
  });

  it('carries the user, the session, one audience and the organisation, and names its key', async () => {
    const { tokens, clock } = build(ONLY_KEY_1);

    const [header, payload] = (await tokens.sign(USER, clock.now())).split('.');

    expect(decode(header ?? '')).toEqual(HEADER);
    expect(decode(payload ?? '')).toEqual(CLAIMS);
  });

  it('carries a null organisation for a customer', async () => {
    const { tokens, clock } = build(ONLY_KEY_1);
    const customer: AuthenticatedUser = {
      ...USER,
      audience: 'customer',
      organisationId: null,
    };

    const token = await tokens.sign(customer, clock.now());

    expect(await tokens.verify(token)).toEqual({
      status: 'valid',
      user: customer,
    });
  });

  describe('expiry', () => {
    it('is valid one second before it expires', async () => {
      const { tokens, clock } = build(ONLY_KEY_1);
      const token = await tokens.sign(USER, clock.now());
      clock.advanceSeconds(899);

      expect((await tokens.verify(token)).status).toBe('valid');
    });

    it('is expired, not invalid, from the moment it expires', async () => {
      const { tokens, clock } = build(ONLY_KEY_1);
      const token = await tokens.sign(USER, clock.now());
      clock.advanceSeconds(900);

      expect(await tokens.verify(token)).toEqual({ status: 'expired' });
    });

    it('is invalid, not expired, when it is expired and its signature is wrong', async () => {
      const { tokens } = build(ONLY_KEY_1);
      const forged = forge(
        HEADER,
        { ...CLAIMS, exp: NOW_SECONDS - 10 },
        KEY_2.secret,
      );

      expect(await tokens.verify(forged)).toEqual({ status: 'invalid' });
    });
  });

  describe('key rotation', () => {
    it('signs with the current key and still accepts a token signed with the previous one', async () => {
      const before = build(ONLY_KEY_1);
      const old = await before.tokens.sign(USER, before.clock.now());
      const after = build({
        accessTokenKey: KEY_2,
        previousAccessTokenKey: KEY_1,
      });

      const fresh = await after.tokens.sign(USER, after.clock.now());

      expect(decode(fresh.split('.')[0] ?? '')).toMatchObject({ kid: '2' });
      expect(await after.tokens.verify(old)).toEqual({
        status: 'valid',
        user: USER,
      });
      expect((await after.tokens.verify(fresh)).status).toBe('valid');
    });

    it('rejects a token of the old key once the previous key is removed', async () => {
      const before = build(ONLY_KEY_1);
      const old = await before.tokens.sign(USER, before.clock.now());
      const after = build({
        accessTokenKey: KEY_2,
        previousAccessTokenKey: undefined,
      });

      expect(await after.tokens.verify(old)).toEqual({ status: 'invalid' });
    });

    it('rejects a token that names one key and is signed with the other', async () => {
      const { tokens } = build({
        accessTokenKey: KEY_2,
        previousAccessTokenKey: KEY_1,
      });

      expect(
        await tokens.verify(
          forge({ ...HEADER, kid: '2' }, CLAIMS, KEY_1.secret),
        ),
      ).toEqual({ status: 'invalid' });
    });
  });

  describe('a token that is not ours', () => {
    it.each([
      ['signed with another secret', forge(HEADER, CLAIMS, KEY_2.secret)],
      [
        'naming an unknown key',
        forge({ ...HEADER, kid: '9' }, CLAIMS, KEY_1.secret),
      ],
      [
        'without a key id',
        forge({ alg: 'HS256', typ: 'JWT' }, CLAIMS, KEY_1.secret),
      ],
      [
        'from another issuer',
        forge(HEADER, { ...CLAIMS, iss: 'someone-else' }, KEY_1.secret),
      ],
      [
        'with an audience we do not have',
        forge(HEADER, { ...CLAIMS, aud: 'superuser' }, KEY_1.secret),
      ],
      [
        'with two audiences',
        forge(HEADER, { ...CLAIMS, aud: ['customer', 'admin'] }, KEY_1.secret),
      ],
      [
        'without a session',
        forge(HEADER, { ...CLAIMS, sid: undefined }, KEY_1.secret),
      ],
      [
        'without an expiry',
        forge(HEADER, { ...CLAIMS, exp: undefined }, KEY_1.secret),
      ],
      [
        'declaring the algorithm none, unsigned',
        `${forge({ ...HEADER, alg: 'none' }, CLAIMS, KEY_1.secret)
          .split('.')
          .slice(0, 2)
          .join('.')}.`,
      ],
      [
        'declaring another algorithm, validly signed with it and our key',
        forge({ ...HEADER, alg: 'HS512' }, CLAIMS, KEY_1.secret),
      ],
      ['that is not a token', 'not-a-token'],
      ['that is empty', ''],
    ])('is invalid when %s', async (_label, token) => {
      const { tokens } = build(ONLY_KEY_1);

      expect(await tokens.verify(token)).toEqual({ status: 'invalid' });
    });

    it('is invalid when its payload was changed after signing', async () => {
      const { tokens, clock } = build(ONLY_KEY_1);
      const [header, , signature] = (
        await tokens.sign(USER, clock.now())
      ).split('.');
      const payload = Buffer.from(
        JSON.stringify({ ...CLAIMS, aud: 'admin' }),
      ).toString('base64url');

      expect(await tokens.verify(`${header}.${payload}.${signature}`)).toEqual({
        status: 'invalid',
      });
    });
  });
});
