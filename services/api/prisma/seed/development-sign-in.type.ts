/** A development account as the seed prints it: who signs in, where, and with which fixed code. */
export type DevelopmentSignIn = Readonly<{
  /** E.164, as the API stores it. */
  phone: string;
  code: string;
  audience: string;
  purpose: string;
}>;
