import type { RefreshTokenSecrets } from '../ports/refresh-token-secrets.port';

/** Refresh tokens without randomness: `refresh-token-1`, `refresh-token-2`, … */
export class InMemoryRefreshTokenSecrets implements RefreshTokenSecrets {
  private issued = 0;

  generate(): Readonly<{ token: string; hash: string }> {
    this.issued += 1;
    const token = `refresh-token-${this.issued}`;
    return { token, hash: this.hash(token) };
  }

  hash(token: string): string {
    return `hash(${token})`;
  }
}
