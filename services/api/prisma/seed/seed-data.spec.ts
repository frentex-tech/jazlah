import { normalizeSaudiMobileNumber } from '@common/phone/normalize-saudi-mobile-number';
import { normalizeSaudiPhoneNumber } from '@common/phone/normalize-saudi-phone-number';
// The catalog's own reader of stored change requests, reached past its index on purpose:
// a seeded change request must be one the API can read back, and this test fails as soon
// as the stored format changes.
import { STORED_PRODUCT_CONTENT } from '@modules/catalog/infrastructure/stored-product-content.schema';
import { SEED_CATEGORIES } from './data/categories.constants';
import { SEED_CUSTOMERS } from './data/customers.constants';
import { SEED_CUTTING_STYLES } from './data/cutting-styles.constants';
import { DEVELOPMENT_ACCOUNTS } from './data/development-accounts.constants';
import { SEED_EXCLUSION_ITEMS } from './data/exclusion-items.constants';
import { IMAGE_PALETTES } from './data/image-palettes.constants';
import { SEED_INCOMPATIBILITIES } from './data/incompatibilities.constants';
import { SEED_MEAT_TYPES } from './data/meat-types.constants';
import { SEED_PARTNER_VENDORS } from './data/partner-vendors.constants';
import { SEED_PRODUCTS } from './data/products.constants';
import type { SeedReferenceItem } from './data/seed-reference-item.type';
import { SEED_USERS } from './data/users.constants';
import { SEED_VENDOR_APPLICATIONS } from './data/vendor-applications.constants';
import { buildChangeContent } from './build-change-content';

/**
 * The seed's data sets against the schema's constraints and the catalog's rules: no
 * database runs in unit tests, so every check constraint, unique index and submission
 * rule a seeded row must pass is checked here on the data itself.
 */

/** Characters as PostgreSQL's char_length counts them (code points). */
const chars = (text: string): number => [...text].length;
const keysOf = (items: readonly { key: string }[]): string[] =>
  items.map((item) => item.key);
const unique = (values: readonly string[]): boolean =>
  new Set(values).size === values.length;
const activeKeys = (items: readonly SeedReferenceItem[]): Set<string> =>
  new Set(items.filter((item) => item.isActive).map((item) => item.key));

const ACTIVE_VENDORS = new Set([
  'platform',
  ...SEED_PARTNER_VENDORS.filter(
    (vendor) => vendor.suspensionReason === null,
  ).map((vendor) => vendor.key),
]);

describe('the seed data', () => {
  describe('admin lists', () => {
    it.each([
      ['categories', SEED_CATEGORIES],
      ['meat types', SEED_MEAT_TYPES],
      ['cutting styles', SEED_CUTTING_STYLES],
      ['exclusion items', SEED_EXCLUSION_ITEMS],
    ])(
      '%s have unique keys, both names, active and inactive entries',
      (_, items) => {
        expect(unique(keysOf(items))).toBe(true);
        for (const item of items) {
          expect(chars(item.nameAr)).toBeGreaterThanOrEqual(2);
          expect(chars(item.nameEn)).toBeGreaterThanOrEqual(2);
        }
        expect(items.some((item) => item.isActive)).toBe(true);
        expect(items.some((item) => !item.isActive)).toBe(true);
      },
    );

    it('orders the categories without gaps or negative positions', () => {
      expect(SEED_CATEGORIES.map((category) => category.sortOrder)).toEqual(
        SEED_CATEGORIES.map((_, index) => index),
      );
    });

    it('names known cutting styles in each rule, each pair once', () => {
      const styles = new Set(keysOf(SEED_CUTTING_STYLES));
      for (const rule of SEED_INCOMPATIBILITIES) {
        expect(styles.has(rule.cuttingStyle)).toBe(true);
      }
      expect(
        unique(
          SEED_INCOMPATIBILITIES.map(
            (rule) => `${rule.cuttingStyle}:${rule.packaging}`,
          ),
        ),
      ).toBe(true);
    });
  });

  describe('users and accounts', () => {
    it('has unique keys and unique phones in the fake +9665000000NN block', () => {
      expect(unique(keysOf(SEED_USERS))).toBe(true);
      const phones = SEED_USERS.map((user) =>
        normalizeSaudiMobileNumber(user.phone),
      );
      for (const phone of phones) {
        expect(phone).toMatch(/^\+9665000000\d{2}$/);
      }
      expect(unique(phones.map(String))).toBe(true);
    });

    it('has one development account per audience, each a seeded user with its own digit', () => {
      const users = new Set(keysOf(SEED_USERS));
      for (const account of DEVELOPMENT_ACCOUNTS) {
        expect(users.has(account.user)).toBe(true);
        expect(account.codeDigit).toMatch(/^\d$/);
      }
      expect(
        unique(DEVELOPMENT_ACCOUNTS.map((account) => account.codeDigit)),
      ).toBe(true);
      expect(
        new Set(DEVELOPMENT_ACCOUNTS.map((account) => account.audience)),
      ).toEqual(new Set(['customer', 'vendor', 'kitchen', 'admin']));
    });

    it('makes the development vendor account the owner of an active partner vendor', () => {
      const vendorAccount = DEVELOPMENT_ACCOUNTS.find(
        (account) => account.audience === 'vendor',
      );
      const owned = SEED_PARTNER_VENDORS.filter(
        (vendor) =>
          vendor.suspensionReason === null &&
          SEED_VENDOR_APPLICATIONS.find(
            (application) => application.key === vendor.application,
          )?.applicant === vendorAccount?.user,
      );
      expect(owned).toHaveLength(1);
    });
  });

  describe('vendor applications and vendors', () => {
    it('covers every status, with the review fields the check constraint requires', () => {
      expect(unique(keysOf(SEED_VENDOR_APPLICATIONS))).toBe(true);
      expect(
        new Set(SEED_VENDOR_APPLICATIONS.map((item) => item.status)),
      ).toEqual(new Set(['pending', 'approved', 'rejected']));
      const users = new Set(keysOf(SEED_USERS));
      for (const application of SEED_VENDOR_APPLICATIONS) {
        expect(users.has(application.applicant)).toBe(true);
        expect(application.rejectionReason !== null).toBe(
          application.status === 'rejected',
        );
        expect(application.commercialRegistrationNumber).toMatch(/^\d{10}$/);
        // vendor_applications_vat_number_check, vendor_applications_city_check
        expect(
          application.vatNumber === null ||
            /^3\d{13}3$/.test(application.vatNumber),
        ).toBe(true);
        expect(chars(application.city)).toBeGreaterThanOrEqual(2);
        expect(chars(application.city)).toBeLessThanOrEqual(50);
        expect(Math.abs(application.latitude)).toBeLessThanOrEqual(90);
        expect(Math.abs(application.longitude)).toBeLessThanOrEqual(180);
        expect(application.documents.length).toBeGreaterThan(0);
        expect(unique(application.documents)).toBe(true);
        expect(chars(application.accountHolderName)).toBeGreaterThanOrEqual(2);
      }
    });

    it('has at most one pending application per applicant', () => {
      const pending = SEED_VENDOR_APPLICATIONS.filter(
        (application) => application.status === 'pending',
      ).map((application) => application.applicant);
      expect(unique(pending)).toBe(true);
    });

    it('makes each partner vendor from its own approved application', () => {
      expect(unique(keysOf(SEED_PARTNER_VENDORS))).toBe(true);
      expect(
        unique(SEED_PARTNER_VENDORS.map((vendor) => vendor.application)),
      ).toBe(true);
      for (const vendor of SEED_PARTNER_VENDORS) {
        const application = SEED_VENDOR_APPLICATIONS.find(
          (item) => item.key === vendor.application,
        );
        expect(application?.status).toBe('approved');
        expect(vendor.commissionBasisPoints).toBeGreaterThanOrEqual(0);
        expect(vendor.commissionBasisPoints).toBeLessThanOrEqual(10_000);
        expect(vendor.logoColor).toMatch(/^#[0-9A-F]{6}$/i);
        expect(vendor.coverColor).toMatch(/^#[0-9A-F]{6}$/i);
        expect(normalizeSaudiPhoneNumber(vendor.contactPhone)).not.toBeNull();
        expect(vendor.contactEmail).toMatch(
          /^[a-z.]+@([a-z]+\.)?example\.com$/,
        );
      }
      expect(ACTIVE_VENDORS.size - 1).toBeGreaterThanOrEqual(3);
      expect(
        SEED_PARTNER_VENDORS.some((vendor) => vendor.suspensionReason !== null),
      ).toBe(true);
    });
  });

  describe('products', () => {
    const categories = new Set(keysOf(SEED_CATEGORIES));
    const meatTypes = new Set(keysOf(SEED_MEAT_TYPES));
    const cuttingStyles = new Set(keysOf(SEED_CUTTING_STYLES));
    const exclusionItems = new Set(keysOf(SEED_EXCLUSION_ITEMS));
    const vendors = new Set(['platform', ...keysOf(SEED_PARTNER_VENDORS)]);

    it('has unique keys', () => {
      expect(unique(keysOf(SEED_PRODUCTS))).toBe(true);
    });

    it.each(SEED_PRODUCTS.map((product) => [product.key, product] as const))(
      '%s fits the schema',
      (_, product) => {
        expect(vendors.has(product.vendor)).toBe(true);
        expect(categories.has(product.category)).toBe(true);
        expect(
          product.meatType === null || meatTypes.has(product.meatType),
        ).toBe(true);
        expect(
          product.meatType === null || product.meatType in IMAGE_PALETTES,
        ).toBe(true);
        for (const name of [product.name.ar, product.name.en]) {
          expect(chars(name)).toBeGreaterThanOrEqual(2);
          expect(chars(name)).toBeLessThanOrEqual(100);
        }
        // products_review_check
        expect(product.rejectionReason !== null).toBe(
          product.status === 'rejected',
        );
        expect(product.isAvailable || product.status === 'published').toBe(
          true,
        );
        expect(
          product.pendingChange === null || product.status === 'published',
        ).toBe(true);
        // product_sizes_values_check, product_images_position_check and the limits
        expect(product.images).toBeGreaterThanOrEqual(0);
        expect(product.images).toBeLessThanOrEqual(10);
        expect(product.sizes.length).toBeLessThanOrEqual(20);
        for (const size of [
          ...product.sizes,
          ...(product.pendingChange === null
            ? []
            : [product.pendingChange.newSize]),
        ]) {
          expect(Number.isInteger(size.priceHalalas)).toBe(true);
          expect(size.priceHalalas).toBeGreaterThan(0);
          expect(size.priceHalalas).toBeLessThanOrEqual(100_000_000);
          expect(Number.isInteger(size.approxWeightGrams)).toBe(true);
          expect(size.approxWeightGrams).toBeGreaterThan(0);
        }
        // the unique indexes on a product's options
        expect(unique(product.cuttings.map((cutting) => cutting.style))).toBe(
          true,
        );
        expect(unique(product.packagings)).toBe(true);
        expect(unique(product.exclusions)).toBe(true);
        for (const cutting of product.cuttings) {
          expect(cuttingStyles.has(cutting.style)).toBe(true);
          expect(Number.isInteger(cutting.extraPriceHalalas)).toBe(true);
          expect(cutting.extraPriceHalalas).toBeGreaterThanOrEqual(0);
        }
        for (const key of product.exclusions) {
          expect(exclusionItems.has(key)).toBe(true);
        }
      },
    );

    it.each(
      SEED_PRODUCTS.filter(
        (product) =>
          product.status === 'published' || product.status === 'pending_review',
      ).map((product) => [product.key, product] as const),
    )('%s could have been submitted', (_, product) => {
      // What the catalog checks at submission: a size, an image, no incompatible
      // cutting and packaging, and only active list entries.
      expect(product.sizes.length).toBeGreaterThan(0);
      expect(product.images).toBeGreaterThan(0);
      expect(activeKeys(SEED_CATEGORIES).has(product.category)).toBe(true);
      expect(
        product.meatType === null ||
          activeKeys(SEED_MEAT_TYPES).has(product.meatType),
      ).toBe(true);
      for (const cutting of product.cuttings) {
        expect(activeKeys(SEED_CUTTING_STYLES).has(cutting.style)).toBe(true);
      }
      for (const key of product.exclusions) {
        expect(activeKeys(SEED_EXCLUSION_ITEMS).has(key)).toBe(true);
      }
      const offered = SEED_INCOMPATIBILITIES.filter(
        (rule) =>
          product.cuttings.some(
            (cutting) => cutting.style === rule.cuttingStyle,
          ) && product.packagings.includes(rule.packaging),
      );
      expect(offered).toEqual([]);
    });

    it('has at least 30 published, available products of active vendors, and every other state', () => {
      const shown = SEED_PRODUCTS.filter(
        (product) =>
          product.status === 'published' &&
          product.isAvailable &&
          ACTIVE_VENDORS.has(product.vendor),
      );
      expect(shown.length).toBeGreaterThanOrEqual(30);
      for (const status of ['draft', 'pending_review', 'rejected'] as const) {
        expect(SEED_PRODUCTS.some((product) => product.status === status)).toBe(
          true,
        );
      }
      expect(
        SEED_PRODUCTS.some(
          (product) => product.status === 'published' && !product.isAvailable,
        ),
      ).toBe(true);
      expect(
        SEED_PRODUCTS.some((product) => product.pendingChange !== null),
      ).toBe(true);
    });

    it('prices a whole Naimi lamb at Riyadh market levels', () => {
      const prices = SEED_PRODUCTS.filter(
        (product) =>
          product.category === 'whole-carcasses' &&
          product.meatType === 'naimi' &&
          product.status === 'published',
      ).flatMap((product) => product.sizes.map((size) => size.priceHalalas));
      expect(Math.min(...prices)).toBeGreaterThanOrEqual(160_000);
      expect(Math.max(...prices)).toBeLessThanOrEqual(220_000);
    });

    it('stores each pending change request in the shape the catalog reads back', () => {
      for (const product of SEED_PRODUCTS) {
        if (product.pendingChange === null) {
          continue;
        }
        const content = buildChangeContent(product, product.pendingChange, [
          'image-1',
        ]);
        const parsed = STORED_PRODUCT_CONTENT.parse(content);
        expect(parsed.sizes).toHaveLength(product.sizes.length + 1);
        expect(parsed.sizes.at(-1)?.id).toBeNull();
      }
    });
  });

  describe('customers', () => {
    it('gives each customer at most one entry, for a seeded user', () => {
      const users = new Set(keysOf(SEED_USERS));
      const customers = SEED_CUSTOMERS.map((customer) => customer.user);
      expect(unique(customers)).toBe(true);
      for (const user of customers) {
        expect(users.has(user)).toBe(true);
      }
    });

    it.each(
      SEED_CUSTOMERS.map((customer) => [customer.user, customer] as const),
    )('%s fits the schema', (_, customer) => {
      // customer_profiles_full_name_check, customer_profiles_email_check
      if (customer.fullName !== null) {
        expect(chars(customer.fullName)).toBeGreaterThanOrEqual(2);
        expect(chars(customer.fullName)).toBeLessThanOrEqual(60);
      }
      if (customer.email !== null) {
        expect(customer.email).toBe(customer.email.toLowerCase());
      }
      // at most ten addresses, exactly one default once any exist
      expect(customer.addresses.length).toBeLessThanOrEqual(10);
      expect(
        customer.addresses.filter((address) => address.isDefault),
      ).toHaveLength(customer.addresses.length === 0 ? 0 : 1);
      for (const address of customer.addresses) {
        // customer_addresses_text_check, customer_addresses_location_check
        expect(chars(address.label)).toBeGreaterThanOrEqual(1);
        expect(chars(address.label)).toBeLessThanOrEqual(30);
        expect(
          address.shortNationalAddress === null ||
            /^[A-Z]{4}[0-9]{4}$/.test(address.shortNationalAddress),
        ).toBe(true);
        // Riyadh
        expect(address.latitude).toBeGreaterThan(24.4);
        expect(address.latitude).toBeLessThan(25.1);
        expect(address.longitude).toBeGreaterThan(46.4);
        expect(address.longitude).toBeLessThan(47);
        for (const text of [
          address.city,
          address.district,
          address.street,
          address.building,
        ]) {
          expect(text === null || chars(text) <= 100).toBe(true);
        }
      }
    });

    it('has a complete development customer and one without a name', () => {
      const byUser = new Map(
        SEED_CUSTOMERS.map((customer) => [customer.user, customer]),
      );
      expect(byUser.get('dev-customer')?.fullName).not.toBeNull();
      expect(byUser.get('dev-customer')?.addresses.length).toBeGreaterThan(0);
      expect(byUser.get('dev-customer-new')?.fullName).toBeNull();
    });
  });
});
