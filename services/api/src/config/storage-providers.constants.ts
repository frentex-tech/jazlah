/**
 * The storage providers STORAGE_PROVIDER may name. A new vendor adds its name here
 * and one registration in `src/integrations/storage/storage.module.ts`.
 */
/**
 * `disabled` means no object storage: staging before its S3 account exists. It is
 * refused when DEPLOYMENT_ENV is production (env.schema.ts).
 */
export const STORAGE_PROVIDERS = ['s3', 'disabled'] as const;
