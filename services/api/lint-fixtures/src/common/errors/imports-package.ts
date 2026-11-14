// lint-rule: R8 violates
// src/common/errors is imported by domain code, so it may not import a package.
import { HttpStatus } from '@nestjs/common';

export const NOT_FOUND_STATUS = HttpStatus.NOT_FOUND;
