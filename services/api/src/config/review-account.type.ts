/** A review account: a phone number (E.164) whose verification code is fixed. */
export type ReviewAccount = Readonly<{ phone: string; code: string }>;
