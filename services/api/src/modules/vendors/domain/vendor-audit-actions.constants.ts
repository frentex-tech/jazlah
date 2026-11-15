/**
 * What the vendors module writes to the audit log (`action`, with `entity`): every
 * review, suspension, reinstatement and commission change, and the platform vendor's
 * creation (FR-ADM-12).
 */
export const VENDOR_AUDIT = {
  applicationApproved: {
    action: 'vendors.application.approved',
    entity: 'vendor_application',
  },
  applicationRejected: {
    action: 'vendors.application.rejected',
    entity: 'vendor_application',
  },
  vendorSuspended: { action: 'vendors.vendor.suspended', entity: 'vendor' },
  vendorReinstated: { action: 'vendors.vendor.reinstated', entity: 'vendor' },
  commissionChanged: {
    action: 'vendors.vendor.commission_changed',
    entity: 'vendor',
  },
  platformVendorCreated: { action: 'vendors.vendor.created', entity: 'vendor' },
} as const;
