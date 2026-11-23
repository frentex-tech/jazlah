import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { FakeSmsProvider } from '@integrations/sms/testing';

/** What a successful verification returns. */
export type SignedInBody = {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  principal: {
    userId: string;
    phone: string;
    audience: string;
    organisationId: string | null;
    sessionId: string;
  };
  /** A customer's: whether the profile has a full name; null for staff. */
  profileComplete: boolean | null;
};

/**
 * The auth endpoints as a client calls them, for the e2e tests, with the fake sms
 * provider standing in for the phone: `codeFor` reads the code out of the last message
 * sent to a number.
 */
export class AuthClient {
  constructor(
    private readonly app: INestApplication<App>,
    private readonly sms: FakeSmsProvider,
  ) {}

  requestCode(phone: string, audience = 'customer'): request.Test {
    return request(this.app.getHttpServer())
      .post('/v1/public/auth/otp/request')
      .send({ phone, audience });
  }

  verify(
    phone: string,
    code: string,
    audience = 'customer',
    extra: Record<string, unknown> = {},
  ): request.Test {
    return request(this.app.getHttpServer())
      .post('/v1/public/auth/otp/verify')
      .send({ phone, audience, code, devicePlatform: 'ios', ...extra });
  }

  refresh(refreshToken: string): request.Test {
    return request(this.app.getHttpServer())
      .post('/v1/public/auth/refresh')
      .send({ refreshToken });
  }

  logout(refreshToken: string): request.Test {
    return request(this.app.getHttpServer())
      .post('/v1/public/auth/logout')
      .send({ refreshToken });
  }

  me(audience: string, accessToken?: string): request.Test {
    const call = request(this.app.getHttpServer()).get(`/v1/${audience}/me`);
    return accessToken === undefined
      ? call
      : call.set('Authorization', `Bearer ${accessToken}`);
  }

  /** `DELETE /v1/customer/me`, with an optional `?reason=`. */
  deleteAccount(accessToken: string, reason?: string): request.Test {
    const call = request(this.app.getHttpServer())
      .delete('/v1/customer/me')
      .set('Authorization', `Bearer ${accessToken}`);
    return reason === undefined ? call : call.query({ reason });
  }

  logoutAll(audience: string, accessToken: string): request.Test {
    return request(this.app.getHttpServer())
      .post(`/v1/${audience}/auth/logout-all`)
      .set('Authorization', `Bearer ${accessToken}`);
  }

  /** The messages sent to `phone`, oldest first. */
  messagesTo(phone: string): string[] {
    return this.sms.sent
      .filter((message) => message.to === phone)
      .map((message) => message.text);
  }

  /**
   * The code in the last message sent to `phone`. Waits for it, because a staff
   * request answers before its message is sent.
   */
  async codeFor(phone: string): Promise<string> {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const code = /\d{4,8}/.exec(this.messagesTo(phone).at(-1) ?? '')?.[0];
      if (code !== undefined) {
        return code;
      }
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error('no verification message was sent to the phone');
  }

  /** Requests a code and verifies it: a whole sign-in. */
  async signIn(phone: string, audience = 'customer'): Promise<SignedInBody> {
    await this.requestCode(phone, audience).expect(200);
    const res = await this.verify(
      phone,
      await this.codeFor(phone),
      audience,
    ).expect(200);
    return res.body as SignedInBody;
  }
}
