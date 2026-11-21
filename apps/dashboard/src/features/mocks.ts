// Every feature's in-process mock, for lib/mock-backends.ts only (never import it elsewhere: it would ship the mocks).
export { mockAdminVendors as adminVendors } from './admin-vendors/backend.mock';
export { mockAdminCatalog as adminCatalog } from './catalog/backend.mock';
export { mockCoverage as coverage } from './coverage/backend.mock';
export { mockOperations as operations } from './operations/backend.mock';
export { mockVendorCatalog as vendorCatalog } from './catalog/vendor-backend.mock';
export { mockOnboarding as onboarding, mockStorage as storage } from './vendor-onboarding/backend.mock';
export { mockOrders as orders, mockPlaceOrder as placeOrder } from './orders/backend.mock';
