/** The pair a sign-in or a refresh returns, with each token's remaining life. */
export type AuthTokens = Readonly<{
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
}>;
