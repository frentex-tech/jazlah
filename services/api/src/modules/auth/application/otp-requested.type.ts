/** What a code request answers: the same for every phone and audience. */
export type OtpRequested = Readonly<{
  /** How long the code lives. */
  expiresInSeconds: number;
  /** How long the client waits before it may ask for another code. */
  resendAfterSeconds: number;
}>;
