import { z } from 'zod';
import { ORDER_TYPES } from '@modules/orders';
import { CLOSED_DAY_SCOPES } from './closed-day-scopes.constants';
import { COD_CONFIRMATION_MODES } from './cod-confirmation-modes.constants';

const TIME_OF_DAY = /^([01]\d|2[0-3]):[0-5]\d$/;
const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

const CUTOFF_RULE = z.object({
  time: z.string().regex(TIME_OF_DAY).nullable(),
  leadDays: z.number().int().min(0).max(30),
});

/**
 * The columns of `operations_settings` the database types loosely (JSON, text and text
 * arrays), validated when read (R21): `cutoffs`, `closed_days`,
 * `cod_allowed_order_types`, `cod_confirmation`. A row that does not match ends as
 * INTERNAL_ERROR, never as a guess.
 */
export const OPERATIONS_SETTINGS_ROW_SCHEMA = z.object({
  cutoffs: z.object({
    readyMeat: CUTOFF_RULE,
    carcass: CUTOFF_RULE,
    cooked: CUTOFF_RULE,
    occasion: CUTOFF_RULE,
    adha: CUTOFF_RULE,
  }),
  closedDays: z.array(
    z.object({
      date: z.string().regex(CALENDAR_DATE),
      scope: z.enum(CLOSED_DAY_SCOPES),
      reasonAr: z.string(),
      reasonEn: z.string(),
    }),
  ),
  codAllowedOrderTypes: z.array(z.enum(ORDER_TYPES)),
  codConfirmation: z.enum(COD_CONFIRMATION_MODES),
});
