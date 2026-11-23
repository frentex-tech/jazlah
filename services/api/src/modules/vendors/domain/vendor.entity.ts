import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { FieldError } from '@common/errors/field-error.type';
import type { LocalizedText } from '@common/i18n/localized-text.type';
import { COMMISSION_BASIS_POINTS } from './commission-basis-points.constants';
import type { GeoPoint } from './geo-point.type';
import type { OptionalLocalizedText } from '@common/i18n/optional-localized-text.type';
import type { VendorStatus } from './vendor-status.type';

/**
 * A merchant selling on the platform, or the platform's own vendor (`isPlatform`), which
 * has no business or bank details. Its status changes only through
 * VendorStatusMachine; its commission applies to future orders, and every change is
 * kept in the commission history.
 */
export class Vendor {
  constructor(
    readonly id: string,
    readonly name: LocalizedText,
    readonly description: OptionalLocalizedText,
    /** Null until the vendor sets a logo. */
    readonly logoMediaId: string | null,
    /** Null until the vendor or an admin sets a cover photo. */
    readonly coverMediaId: string | null,
    /** Null until set. E.164, a Saudi mobile or landline. Not public. */
    readonly contactPhone: string | null,
    /** Null until set. Lowercase. Not public. */
    readonly contactEmail: string | null,
    /** Null until set or copied from the application. 15 digits. Not public. */
    readonly vatNumber: string | null,
    /**
     * Null for the platform vendor and vendors approved before the city was asked. Only
     * an admin changes it. Public.
     */
    readonly city: string | null,
    readonly isPlatform: boolean,
    readonly status: VendorStatus,
    /** Null while active. */
    readonly suspendedAt: Date | null,
    /** Null while active. */
    readonly suspensionReason: string | null,
    readonly commissionBasisPoints: number,
    /** Null only for the platform vendor. */
    readonly commercialRegistrationNumber: string | null,
    /** Null only for the platform vendor. */
    readonly ibanLast4: string | null,
    /** Null only for the platform vendor. */
    readonly accountHolderName: string | null,
    /** Null only for the platform vendor. */
    readonly location: GeoPoint | null,
    /** Null only for the platform vendor. */
    readonly applicationId: string | null,
    readonly createdAt: Date,
  ) {}

  /**
   * Throws VALIDATION_FAILED (field `commissionBasisPoints`) unless `basisPoints` is a
   * whole number from 0 to 10000.
   */
  static assertCommission(basisPoints: number): void {
    if (
      !Number.isInteger(basisPoints) ||
      basisPoints < COMMISSION_BASIS_POINTS.min ||
      basisPoints > COMMISSION_BASIS_POINTS.max
    ) {
      const details: FieldError[] = [
        { field: 'commissionBasisPoints', constraints: ['commissionRange'] },
      ];
      throw new AppError(ErrorCode.VALIDATION_FAILED, { details });
    }
  }
}
