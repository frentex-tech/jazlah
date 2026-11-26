import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { CartSettings } from './cart-settings.type';

/**
 * ORDERING_PAUSED while the admin has paused new orders, with the admin's message
 * (`details.messageAr`, `details.messageEn`): every cart change and checkout call checks it.
 */
export function assertOrderingOpen(settings: CartSettings): void {
  if (settings.pause.isPaused) {
    throw new AppError(ErrorCode.ORDERING_PAUSED, {
      details: {
        messageAr: settings.pause.messageAr,
        messageEn: settings.pause.messageEn,
      },
    });
  }
}
