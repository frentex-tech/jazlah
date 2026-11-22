/**
 * The tags of the OpenAPI document: one per module and audience, so the Swagger page
 * reads as a menu and each generated client has one class per tag (`Customer
 * addresses` becomes `CustomerAddressesApi`). Every operation has exactly one, given
 * with `@ApiTags(API_TAGS.<key>.name)` on its controller or method; the document lists
 * them in this order with their descriptions (buildOpenApiDocument).
 *
 * A new controller uses the tag of its module and audience, or adds one here. Renaming
 * a tag renames a class in every generated client.
 */
export const API_TAGS = {
  publicAuth: {
    name: 'Public auth',
    description:
      'Sign-in with a phone number and a code sent by SMS, token refresh and sign-out. Public: called before the app has a token. Every app (customer, vendor, kitchen, admin) signs in here, naming its audience.',
  },
  publicCatalog: {
    name: 'Public catalog',
    description:
      'Categories and published products, for browsing before or after sign-in. Public.',
  },
  publicVendors: {
    name: 'Public vendors',
    description: 'Active vendors (stores) as customers see them. Public.',
  },
  publicCoverage: {
    name: 'Public coverage',
    description:
      'Whether we deliver to a point on the map (the active coverage zones). Public.',
  },
  customerAccount: {
    name: 'Customer account',
    description:
      'The signed-in customer: who they are, signing out everywhere, and deleting the account. Customer app.',
  },
  customerProfile: {
    name: 'Customer profile',
    description:
      'The customer profile (name, email, language) and marketing consent. Customer app.',
  },
  customerAddresses: {
    name: 'Customer addresses',
    description:
      'The customer saved delivery addresses: at most ten, exactly one default. Customer app.',
  },
  customerVendorApplications: {
    name: 'Customer vendor applications',
    description:
      'A customer applying to sell on the platform, and following the application. Customer app.',
  },
  customerMedia: {
    name: 'Customer media',
    description:
      'File uploads by a customer (vendor application documents). Customer app.',
  },
  vendorAccount: {
    name: 'Vendor account',
    description:
      'The signed-in vendor user and signing out everywhere. Vendor dashboard.',
  },
  vendorProfile: {
    name: 'Vendor profile',
    description: 'The vendor own store profile. Vendor dashboard.',
  },
  vendorProducts: {
    name: 'Vendor products',
    description:
      'The vendor own products: drafts, review, edits, prices, availability and fulfilment. Vendor dashboard.',
  },
  vendorCatalogLists: {
    name: 'Vendor catalog lists',
    description:
      'The active meat types, cutting styles and "without" items a product can choose, and the cutting and packaging pairs it cannot combine, for the product form. Vendor dashboard.',
  },
  vendorMedia: {
    name: 'Vendor media',
    description: 'File uploads by a vendor (product images). Vendor dashboard.',
  },
  kitchenAccount: {
    name: 'Kitchen account',
    description:
      'The signed-in kitchen user and signing out everywhere. Kitchen dashboard.',
  },
  adminAccount: {
    name: 'Admin account',
    description:
      'The signed-in admin and signing out everywhere. Admin dashboard.',
  },
  adminVendorApplications: {
    name: 'Admin vendor applications',
    description:
      'Reviewing vendor applications: list, read, approve, reject. Admin dashboard.',
  },
  adminVendors: {
    name: 'Admin vendors',
    description:
      'Managing vendors: list, read, suspend, reinstate, edit the profile and the commission. Admin dashboard.',
  },
  adminCatalogLists: {
    name: 'Admin catalog lists',
    description:
      'The reference lists products are built from (categories, meat types, cutting styles, exclusion items) and the cutting and packaging pairs that cannot be combined. Admin dashboard.',
  },
  adminProducts: {
    name: 'Admin products',
    description:
      'Every vendor product: review (approve, reject), direct edits, the platform vendor own products, prices, availability and fulfilment. Admin dashboard.',
  },
  adminProductChangeRequests: {
    name: 'Admin product change requests',
    description:
      'Edits of published products waiting for review: list, approve, reject. Admin dashboard.',
  },
  adminMedia: {
    name: 'Admin media',
    description:
      'File uploads by an admin (images of the platform vendor products). Admin dashboard.',
  },
  adminCoverageZones: {
    name: 'Admin coverage zones',
    description:
      'The delivery areas, drawn as polygons on the map: list, read, create, edit, switch on or off, delete. Admin dashboard.',
  },
  publicSettings: {
    name: 'Public settings',
    description:
      'What the apps need of the operations settings: delivery window, minimum order, delivery fee, cash on delivery, the pause. Public.',
  },
  customerCart: {
    name: 'Customer cart',
    description:
      'The cart, kept on the server: one store, lines, coupon, fulfilment and totals. Customer app.',
  },
  customerScheduling: {
    name: 'Customer scheduling',
    description:
      'The days the cart can be delivered or picked up. Customer app.',
  },
  customerPayments: {
    name: 'Customer payments',
    description:
      'Payment methods, and paying an unpaid order again. Customer app.',
  },
  customerCheckout: {
    name: 'Customer checkout',
    description: 'Placing the cart as an order. Customer app.',
  },
  customerOrders: {
    name: 'Customer orders',
    description: 'The customer’s orders and their detail. Customer app.',
  },
  customerWallet: {
    name: 'Customer wallet',
    description: 'The wallet balance and its history. Customer app.',
  },
  vendorOrders: {
    name: 'Vendor orders',
    description:
      'The vendor’s orders: list, detail, status moves. Vendor dashboard.',
  },
  adminOrders: {
    name: 'Admin orders',
    description:
      'Every order: list, detail, status moves, the cash-on-delivery review. Admin dashboard.',
  },
  adminOperationsSettings: {
    name: 'Admin operations settings',
    description:
      'Delivery window, cut-offs, closed days, capacity, minimum order, fees, cash on delivery and the pause. Admin dashboard.',
  },
  adminVendorCapacity: {
    name: 'Admin vendor capacity',
    description:
      'Each vendor’s daily capacity and one day’s limits. Admin dashboard.',
  },
  adminCoupons: {
    name: 'Admin coupons',
    description:
      'Coupons: list, create, change, switch off, usage. Admin dashboard.',
  },
  adminWallets: {
    name: 'Admin wallets',
    description:
      'Customers’ wallet balances and audited credits or debits. Admin dashboard.',
  },
  webhooksPayments: {
    name: 'Webhooks payments',
    description:
      'Events from payment providers. Called by the providers, never by the apps.',
  },
  health: {
    name: 'Health',
    description:
      'Liveness and readiness probes for the load balancer and monitoring. Not for the apps.',
  },
} as const satisfies Record<
  string,
  Readonly<{ name: string; description: string }>
>;
