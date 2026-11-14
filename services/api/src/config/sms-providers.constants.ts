/**
 * The sms providers SMS_PROVIDERS may list. A new vendor adds its name here, its
 * variables in SMS_PROVIDER_VARIABLES, and one registration in
 * `src/integrations/sms/sms.module.ts`. The fake is not here: tests replace the
 * providers directly, so configuration can never select it.
 */
export const SMS_PROVIDERS = ['log'] as const;
