import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  MethodNotAllowedException,
  Post,
} from '@nestjs/common';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { CreateProbeDto } from './create-probe.dto';

/** Endpoints that validate or throw, mounted only in e2e tests. */
@Controller('probe')
export class ProbeController {
  @Post('validate')
  validate(@Body() body: CreateProbeDto): CreateProbeDto {
    return body;
  }

  /** A POST that reads no body, like an action on a resource (confirm an upload). */
  @Post('no-body')
  @HttpCode(HttpStatus.NO_CONTENT)
  noBody(): void {}

  @Get('plain-error')
  plainError(): never {
    throw new Error('internal detail: connection to 10.0.0.5 refused');
  }

  @Get('method-not-allowed')
  methodNotAllowed(): never {
    throw new MethodNotAllowedException();
  }

  @Get('bad-request')
  badRequest(): never {
    throw new BadRequestException('not a validation failure');
  }

  @Get('conflict')
  conflict(): never {
    throw new AppError(ErrorCode.CONFLICT, {
      details: { reason: 'ALREADY_EXISTS' },
    });
  }
}
