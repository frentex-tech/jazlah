/**
 * The audit actions of the catalog (AuditLogWriter): every admin decision on a product
 * or change request, an admin's direct edit of a published JAZLA product, and every
 * price change.
 */
export const CATALOG_AUDIT = {
  productApproved: { action: 'catalog.product.approved', entity: 'product' },
  productRejected: { action: 'catalog.product.rejected', entity: 'product' },
  productPublished: { action: 'catalog.product.published', entity: 'product' },
  productUpdated: { action: 'catalog.product.updated', entity: 'product' },
  priceChanged: { action: 'catalog.product.price_changed', entity: 'product' },
  changeRequestApproved: {
    action: 'catalog.change_request.approved',
    entity: 'product_change_request',
  },
  changeRequestRejected: {
    action: 'catalog.change_request.rejected',
    entity: 'product_change_request',
  },
} as const;
