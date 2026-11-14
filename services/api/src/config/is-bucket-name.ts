const BUCKET_NAME = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;
const IP_ADDRESS = /^\d{1,3}(\.\d{1,3}){3}$/;

/**
 * Whether a value is a valid general purpose bucket name: 3 to 63 characters of
 * lowercase letters, digits, dots and hyphens, starting and ending with a letter or
 * digit, with no two adjacent dots and not shaped like an IP address (the naming
 * rules of S3-compatible storage). It never echoes the value.
 */
export function isBucketName(value: string): boolean {
  return (
    BUCKET_NAME.test(value) && !value.includes('..') && !IP_ADDRESS.test(value)
  );
}
