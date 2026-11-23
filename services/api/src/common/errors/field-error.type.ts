/**
 * One invalid field in a VALIDATION_FAILED response.
 * `field` is the dotted path (`address.city`, `items.0.quantity`); `constraints` are
 * the names of the failed checks (`isString`, `whitelistValidation`), which are stable
 * and language-neutral, so clients can branch on them.
 */
export type FieldError = Readonly<{
  field: string;
  constraints: readonly string[];
}>;
