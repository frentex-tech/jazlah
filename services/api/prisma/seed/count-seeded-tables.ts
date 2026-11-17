import type { DbContext } from '@infra/database/db-context';

/**
 * How many rows each table the seed writes holds now, seeded or not: printed at the end
 * of a run, so two runs can be compared (a second run must leave every count unchanged).
 */
export async function countSeededTables(
  db: DbContext,
): Promise<ReadonlyArray<readonly [string, number]>> {
  const client = db.client;
  return [
    ['users', await client.user.count()],
    ['user_access', await client.userAccess.count()],
    ['media', await client.media.count()],
    ['categories', await client.category.count()],
    ['meat_types', await client.meatType.count()],
    ['cutting_styles', await client.cuttingStyle.count()],
    ['exclusion_items', await client.exclusionItem.count()],
    [
      'cutting_packaging_incompatibilities',
      await client.cuttingPackagingIncompatibility.count(),
    ],
    ['vendor_applications', await client.vendorApplication.count()],
    [
      'vendor_application_documents',
      await client.vendorApplicationDocument.count(),
    ],
    ['vendors', await client.vendor.count()],
    ['vendor_commission_changes', await client.vendorCommissionChange.count()],
    ['products', await client.product.count()],
    ['product_images', await client.productImage.count()],
    ['product_sizes', await client.productSize.count()],
    ['product_cuttings', await client.productCutting.count()],
    ['product_packagings', await client.productPackagingOption.count()],
    ['product_exclusions', await client.productExclusion.count()],
    ['product_change_requests', await client.productChangeRequest.count()],
    ['customer_profiles', await client.customerProfile.count()],
    ['customer_addresses', await client.customerAddress.count()],
    ['consent_records', await client.consentRecord.count()],
    ['audit_logs', await client.auditLog.count()],
  ];
}
