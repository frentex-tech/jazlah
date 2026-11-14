import { Controller, Get } from '@nestjs/common';

/** A controller with neither an audience prefix nor @Public(): the application must refuse to start with it. */
@Controller('unmarked-probe')
export class UnmarkedProbeController {
  @Get()
  open(): { ok: true } {
    return { ok: true };
  }
}
