/** What happens to a cash-on-delivery order: confirmed at once (`auto`) or held as `new` for an admin to confirm or reject (`review`). */
export const COD_CONFIRMATION_MODES = ['auto', 'review'] as const;
