import { removeFormatCharacters } from '../text/remove-format-characters';

/**
 * A `@Transform` for an email: invisible format characters and surrounding spaces
 * removed, lowercased (stored lowercase: `customer_profiles_email_check`,
 * `vendors_contact_email_check`); blank becomes null (no email). Other values unchanged.
 */
export function toEmail({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const email = removeFormatCharacters(value).trim().toLowerCase();
  return email === '' ? null : email;
}
