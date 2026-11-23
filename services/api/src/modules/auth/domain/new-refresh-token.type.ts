/** What the repository needs to store a new refresh token. */
export type NewRefreshToken = Readonly<{
  sessionId: string;
  tokenHash: string;
  expiresAt: Date;
}>;
