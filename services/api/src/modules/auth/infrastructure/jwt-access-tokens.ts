import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';
import type { AccessTokenVerification } from '@common/auth/access-token-verification.type';
import type { AccessTokenVerifier } from '@common/auth/access-token-verifier.interface';
import { AUDIENCES } from '@common/auth/audiences.constants';
import type { AuthenticatedUser } from '@common/auth/authenticated-user.type';
import { authConfig } from '@config/auth.config';
import type { AuthConfig } from '@config/auth-config.type';
import type { AccessTokens } from '../domain/ports/access-tokens.port';
import { CLOCK, type Clock } from '../domain/ports/clock.port';
import {
  ACCESS_TOKEN_ALGORITHM,
  ACCESS_TOKEN_ISSUER,
} from './access-token.constants';

/** The claims of an access token, validated after its signature (R21: never asserted). */
const claimsSchema = z.object({
  sub: z.uuid(),
  sid: z.uuid(),
  aud: z.enum(AUDIENCES),
  org: z.uuid().nullable(),
  // Required: the library accepts a token without `exp` as one that never expires.
  exp: z.number(),
});

const headerSchema = z.object({
  header: z.object({ kid: z.string() }),
});

/**
 * Access tokens as JWTs signed with HS256.
 *
 * - Claims: `sub` (the user), `sid` (the session), `aud` (the single audience), `org`
 *   (the organisation, or null), `iss`, `iat`, `exp`.
 * - Keys have ids. A token names its key in its header (`kid`). New tokens are signed
 *   with the current key; a token signed with the previous key
 *   (AUTH_ACCESS_TOKEN_PREVIOUS_SECRET and its id) is still accepted, so the key can be
 *   rotated without signing anyone out. A token naming any other key is invalid.
 * - Verification pins the algorithm and the issuer, and reads the time from the Clock.
 *   A token that is ours but past its `exp` is `expired`; anything else that fails is
 *   `invalid`. It never throws.
 */
@Injectable()
export class JwtAccessTokens implements AccessTokens, AccessTokenVerifier {
  constructor(
    private readonly jwt: JwtService,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(authConfig.KEY)
    private readonly config: Pick<
      AuthConfig,
      'accessTokenKey' | 'previousAccessTokenKey' | 'accessTokenTtlSeconds'
    >,
  ) {}

  sign(user: AuthenticatedUser, now: Date): Promise<string> {
    const issuedAt = Math.floor(now.getTime() / 1000);
    return this.jwt.signAsync(
      {
        sub: user.userId,
        sid: user.sessionId,
        aud: user.audience,
        org: user.organisationId,
        iss: ACCESS_TOKEN_ISSUER,
        iat: issuedAt,
        exp: issuedAt + this.config.accessTokenTtlSeconds,
      },
      {
        secret: this.config.accessTokenKey.secret,
        algorithm: ACCESS_TOKEN_ALGORITHM,
        keyid: this.config.accessTokenKey.id,
      },
    );
  }

  async verify(token: string): Promise<AccessTokenVerification> {
    const secret = this.secretOf(token);
    if (secret === undefined) {
      return { status: 'invalid' };
    }
    let payload: unknown;
    try {
      payload = await this.jwt.verifyAsync<object>(token, {
        secret,
        algorithms: [ACCESS_TOKEN_ALGORITHM],
        issuer: ACCESS_TOKEN_ISSUER,
        clockTimestamp: Math.floor(this.clock.now().getTime() / 1000),
      });
    } catch (error) {
      // jsonwebtoken checks the signature before the expiry, so an expired token here
      // was genuinely ours.
      return error instanceof Error && error.name === 'TokenExpiredError'
        ? { status: 'expired' }
        : { status: 'invalid' };
    }
    const claims = claimsSchema.safeParse(payload);
    if (!claims.success) {
      return { status: 'invalid' };
    }
    return {
      status: 'valid',
      user: {
        userId: claims.data.sub,
        sessionId: claims.data.sid,
        audience: claims.data.aud,
        organisationId: claims.data.org,
      },
    };
  }

  /** The secret of the key the token's header names, if it is one of ours. */
  private secretOf(token: string): string | undefined {
    let decoded: unknown;
    try {
      decoded = this.jwt.decode<unknown>(token, { complete: true });
    } catch {
      return undefined;
    }
    const parsed = headerSchema.safeParse(decoded);
    if (!parsed.success) {
      return undefined;
    }
    const { kid } = parsed.data.header;
    if (kid === this.config.accessTokenKey.id) {
      return this.config.accessTokenKey.secret;
    }
    if (kid === this.config.previousAccessTokenKey?.id) {
      return this.config.previousAccessTokenKey.secret;
    }
    return undefined;
  }
}
