import type { COD_CONFIRMATION_MODES } from './cod-confirmation-modes.constants';

/** `auto` or `review` (`COD_CONFIRMATION_MODES`). */
export type CodConfirmationMode = (typeof COD_CONFIRMATION_MODES)[number];
