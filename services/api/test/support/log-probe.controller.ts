import { randomUUID } from 'node:crypto';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { DbContext } from '@infra/database/db-context';
import { PrismaService } from '@infra/database/prisma.service';
import {
  LOG_PROBE_AFTER_HEADERS_MESSAGE,
  LOG_PROBE_ENTITY,
  LOG_PROBE_PHONE,
  LOG_PROBE_THROWN_KEY,
} from './log-probe.constants';

/**
 * Endpoints that fail in ways the request log must record: real database errors on
 * rows holding a phone number, left unmapped so they end as 500 and are logged with the
 * request, and the error filter's edge cases. Mounted only in e2e tests.
 */
@Controller('log-probe')
export class LogProbeController {
  constructor(
    private readonly db: DbContext,
    private readonly prisma: PrismaService,
  ) {}

  /** A primary key violation on an audit row whose metadata holds a phone number. */
  @Get('unique-violation')
  async uniqueViolation(): Promise<never> {
    const row = {
      id: randomUUID(),
      action: 'e2e.log-probe.created',
      entity: LOG_PROBE_ENTITY,
      entityId: randomUUID(),
      metadata: { phone: LOG_PROBE_PHONE },
    };
    await this.db.client.auditLog.create({ data: row });
    await this.db.client.auditLog.create({ data: row });
    throw new Error('expected a unique violation');
  }

  /**
   * A check violation on a row holding a phone number: PostgreSQL's DETAIL, which
   * Prisma keeps in the error's metadata, is "Failing row contains (<the phone>)".
   */
  @Get('check-violation')
  async checkViolation(): Promise<never> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`CREATE TEMP TABLE e2e_log_phones (phone text CHECK (length(phone) < 5)) ON COMMIT DROP`;
      await tx.$executeRaw`INSERT INTO e2e_log_phones (phone) VALUES (${LOG_PROBE_PHONE})`;
    });
    throw new Error('expected a check violation');
  }

  /**
   * A Prisma validation error (an argument the model does not have) on a create whose
   * arguments hold a phone number: Prisma prints the arguments in the message.
   */
  @Get('validation-error')
  async validationError(): Promise<never> {
    const data = {
      action: 'e2e.log-probe.created',
      entity: LOG_PROBE_ENTITY,
      entityId: randomUUID(),
      phone: LOG_PROBE_PHONE,
    };
    await this.db.client.auditLog.create({ data });
    throw new Error('expected a validation error');
  }

  /** Throws a plain object, not an Error, whose value holds a phone number. */
  @Get('thrown-value')
  thrownValue(): never {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- the case under test: a thrown value that is not an Error
    throw { [LOG_PROBE_THROWN_KEY]: LOG_PROBE_PHONE };
  }

  /** Fails after the response has started: the status and part of the body are sent. */
  @Get('after-headers')
  afterHeaders(@Res() res: Response): never {
    res.writeHead(HttpStatus.OK, { 'content-type': 'text/plain' });
    res.write('partial');
    throw new Error(LOG_PROBE_AFTER_HEADERS_MESSAGE);
  }

  /** Throws an HttpException whose status (302) is not an error status. */
  @Get('status-below-400')
  statusBelow400(): never {
    throw new HttpException('moved', HttpStatus.FOUND);
  }
}
