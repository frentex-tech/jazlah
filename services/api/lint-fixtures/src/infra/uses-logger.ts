// lint-rule: R13-console conforms
import { Logger } from '@nestjs/common';

const logger = new Logger('Fixture');

export function report(text: string): void {
  logger.log(text);
}
