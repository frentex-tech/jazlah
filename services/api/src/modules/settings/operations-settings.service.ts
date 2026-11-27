import { Inject, Injectable, Logger } from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { FieldError } from '@common/errors/field-error.type';
import { CLOCK, type Clock } from '@common/time/clock.port';
import { RiyadhCalendar } from '@common/time/riyadh-calendar';
import { AuditLogWriter } from '@infra/audit/audit-log-writer';
import { DbContext } from '@infra/database/db-context';
import {
  Prisma,
  type OperationsSettings as OperationsSettingsRow,
} from '@infra/database/generated/prisma/client';
import { mapPrismaError } from '@infra/database/map-prisma-error';
import { TransactionRunner } from '@infra/database/transaction-runner';
import type { ClosedDay } from './closed-day.type';
import type { OperationsSettings } from './operations-settings.type';
import type { OperationsSettingsChanges } from './operations-settings-changes.type';
import { OPERATIONS_SETTINGS_ROW_SCHEMA } from './operations-settings-row.schema';
import type { OrderingPause } from './ordering-pause.type';
import { SETTINGS_AUDIT } from './settings-audit-actions.constants';

/**
 * The operations settings (table `operations_settings`, SCH-API-1): one row, made by
 * its migration. Read on every cart and checkout call (no cache: one primary-key read,
 * so a change counts from the next request). Every change locks the row, validates
 * against what is saved, writes and audits in one transaction.
 *
 * Rules beyond the request DTOs (VALIDATION_FAILED with the field path):
 * - the delivery window ends after it starts (`deliveryWindow.end`, `endBeforeStart`);
 * - a closed day is named once (`closedDays.<i>.date`, `isNotRepeated`);
 * - a closed day before today in Riyadh is refused unless already saved
 *   (`closedDays.<i>.date`, `notPast`): past days saved are history, kept as sent.
 */
@Injectable()
export class OperationsSettingsService {
  private readonly logger = new Logger(OperationsSettingsService.name);

  constructor(
    private readonly db: DbContext,
    // Narrowed to what is used, so a unit test passes a plain object.
    @Inject(TransactionRunner)
    private readonly transactions: Pick<TransactionRunner, 'run'>,
    private readonly audit: AuditLogWriter,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  /** The settings as saved. */
  async current(): Promise<OperationsSettings> {
    return this.toSettings(await this.readRow());
  }

  /** Applies the keys present in `changes`; the rest stay. Answers the settings after. */
  async update(
    changes: OperationsSettingsChanges,
    actorId: string,
  ): Promise<OperationsSettings> {
    const window = changes.deliveryWindow;
    if (
      window !== undefined &&
      RiyadhCalendar.minutesOf(window.end) <=
        RiyadhCalendar.minutesOf(window.start)
    ) {
      throw this.invalid([
        { field: 'deliveryWindow.end', constraints: ['endBeforeStart'] },
      ]);
    }
    const row = await this.transactions.run(async () => {
      await this.lockRow();
      const saved = this.toSettings(await this.readRow());
      const closedDays =
        changes.closedDays === undefined
          ? undefined
          : this.checkedClosedDays(changes.closedDays, saved.closedDays);
      const updated = await this.query(() =>
        this.db.client.operationsSettings.update({
          where: { singleton: true },
          data: this.toData({ ...changes, closedDays }),
        }),
      );
      await this.audit.write({
        actorId,
        ...SETTINGS_AUDIT.operationsUpdated,
        entityId: updated.id,
        metadata: {
          keys: Object.entries(changes)
            .filter(([, value]) => value !== undefined)
            .map(([key]) => key)
            .sort()
            .join(','),
        },
      });
      return updated;
    });
    return this.toSettings(row);
  }

  /** Pauses new orders with the messages customers see, or resumes them. */
  async setPause(
    pause: OrderingPause,
    actorId: string,
  ): Promise<OperationsSettings> {
    const row = await this.transactions.run(async () => {
      await this.lockRow();
      const updated = await this.query(() =>
        this.db.client.operationsSettings.update({
          where: { singleton: true },
          data: pause.isPaused
            ? {
                isPaused: true,
                pauseMessageAr: pause.messageAr,
                pauseMessageEn: pause.messageEn,
              }
            : { isPaused: false, pauseMessageAr: null, pauseMessageEn: null },
        }),
      );
      await this.audit.write({
        actorId,
        ...(pause.isPaused
          ? SETTINGS_AUDIT.orderingPaused
          : SETTINGS_AUDIT.orderingResumed),
        entityId: updated.id,
      });
      return updated;
    });
    return this.toSettings(row);
  }

  /** The new list in date order, or VALIDATION_FAILED for a repeated or newly past day. */
  private checkedClosedDays(
    sent: readonly ClosedDay[],
    saved: readonly ClosedDay[],
  ): ClosedDay[] {
    const today = RiyadhCalendar.dateOf(this.clock.now());
    const savedDates = new Set(saved.map((day) => day.date));
    const seen = new Set<string>();
    const errors: FieldError[] = [];
    sent.forEach((day, index) => {
      const constraints: string[] = [];
      if (seen.has(day.date)) {
        constraints.push('isNotRepeated');
      }
      if (day.date < today && !savedDates.has(day.date)) {
        constraints.push('notPast');
      }
      seen.add(day.date);
      if (constraints.length > 0) {
        errors.push({ field: `closedDays.${index}.date`, constraints });
      }
    });
    if (errors.length > 0) {
      throw this.invalid(errors);
    }
    return [...sent].sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  private toData(
    changes: OperationsSettingsChanges,
  ): Prisma.OperationsSettingsUpdateInput {
    const { deliveryWindow, defaultCapacity, cod, cutoffs, closedDays } =
      changes;
    return {
      ...(deliveryWindow && {
        deliveryWindowStart: deliveryWindow.start,
        deliveryWindowEnd: deliveryWindow.end,
      }),
      ...(cutoffs && { cutoffs: { ...cutoffs } }),
      ...(defaultCapacity && {
        defaultOrdersPerDay: defaultCapacity.ordersPerDay,
        defaultCarcassesPerDay: defaultCapacity.carcassesPerDay,
      }),
      ...(cod && {
        codEnabled: cod.enabled,
        codMaxOrderHalalas: cod.maxOrderHalalas,
        codAllowedOrderTypes: [...cod.allowedOrderTypes],
        codConfirmation: cod.confirmation,
      }),
      bookingHorizonDays: changes.bookingHorizonDays,
      minOrderHalalas: changes.minOrderHalalas,
      deliveryFeeHalalas: changes.deliveryFeeHalalas,
      complaintWindowHours: changes.complaintWindowHours,
      ...(closedDays && { closedDays: closedDays.map((day) => ({ ...day })) }),
    };
  }

  private toSettings(row: OperationsSettingsRow): OperationsSettings {
    const loose = OPERATIONS_SETTINGS_ROW_SCHEMA.parse({
      cutoffs: row.cutoffs,
      closedDays: row.closedDays,
      codAllowedOrderTypes: row.codAllowedOrderTypes,
      codConfirmation: row.codConfirmation,
    });
    return {
      deliveryWindow: {
        start: row.deliveryWindowStart,
        end: row.deliveryWindowEnd,
      },
      cutoffs: loose.cutoffs,
      defaultCapacity: {
        ordersPerDay: row.defaultOrdersPerDay,
        carcassesPerDay: row.defaultCarcassesPerDay,
      },
      cod: {
        enabled: row.codEnabled,
        maxOrderHalalas: row.codMaxOrderHalalas,
        allowedOrderTypes: loose.codAllowedOrderTypes,
        confirmation: loose.codConfirmation,
      },
      bookingHorizonDays: row.bookingHorizonDays,
      minOrderHalalas: row.minOrderHalalas,
      deliveryFeeHalalas: row.deliveryFeeHalalas,
      complaintWindowHours: row.complaintWindowHours,
      closedDays: loose.closedDays,
      paused: {
        isPaused: row.isPaused,
        messageAr: row.pauseMessageAr,
        messageEn: row.pauseMessageEn,
      },
      updatedAt: row.updatedAt,
    };
  }

  private async readRow(): Promise<OperationsSettingsRow> {
    const row = await this.query(() =>
      this.db.client.operationsSettings.findUnique({
        where: { singleton: true },
      }),
    ).catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientValidationError) {
        this.logger.error(
          {
            prismaErrorMessage: error.message,
            prismaErrorStack: error.stack,
          },
          'Operations settings read failed',
        );
      }
      throw error;
    });
    if (row === null) {
      // The migration makes the row; without it the database is not migrated.
      throw new AppError(ErrorCode.INTERNAL_ERROR, {
        cause: new Error('operations_settings has no row'),
      });
    }
    return row;
  }

  /** Locks the settings row for the rest of the transaction (modules.md, row locks). */
  private async lockRow(): Promise<void> {
    await this.query(
      () => this.db.client.$queryRaw`
        SELECT "id" FROM "operations_settings" WHERE "singleton" FOR UPDATE`,
    );
  }

  private invalid(details: readonly FieldError[]): AppError {
    return new AppError(ErrorCode.VALIDATION_FAILED, { details });
  }

  private async query<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      mapPrismaError(error);
    }
  }
}
