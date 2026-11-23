import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { RefreshTokenSecrets } from '../domain/ports/refresh-token-secrets.port';

/**
 * Refresh tokens: 32 random bytes (256 bits) in base64url, stored as their SHA-256.
 * A plain hash is enough here, unlike for verification codes: the token is too long to
 * guess, so a leaked hash cannot be reversed.
 */
@Injectable()
export class RandomRefreshTokenSecrets implements RefreshTokenSecrets {
  generate(): Readonly<{ token: string; hash: string }> {
    const token = randomBytes(32).toString('base64url');
    return { token, hash: this.hash(token) };
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
