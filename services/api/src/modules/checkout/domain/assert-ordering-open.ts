import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import type { OrderingPause } from './ordering-pause.type';

/** ORDERING_PAUSED while the admin has paused new orders, with the admin's message (`details.messageAr`, `details.messageEn`). */
export function assertOrderingOpen(pause: OrderingPause): void {
  if (pause.isPaused) {
    throw new AppError(ErrorCode.ORDERING_PAUSED, {
      details: { messageAr: pause.messageAr, messageEn: pause.messageEn },
    });
  }
}
