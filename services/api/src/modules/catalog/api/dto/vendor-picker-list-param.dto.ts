import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { VENDOR_PICKER_LIST_PATHS } from '../vendor-picker-list-paths.constants';
import type { VendorPickerListPath } from '../vendor-picker-list-path.type';

/** The `:list` path parameter of a vendor's picker: which list. */
export class VendorPickerListParamDto {
  @ApiProperty({
    enum: Object.keys(VENDOR_PICKER_LIST_PATHS),
    example: 'cutting-styles',
    description:
      'Which list: `meat-types`, `cutting-styles` or `exclusion-items` (the "without" items a customer can ask to leave out). Categories come from GET /v1/public/categories. Another value is VALIDATION_FAILED on `list`.',
  })
  @IsIn(Object.keys(VENDOR_PICKER_LIST_PATHS))
  list!: VendorPickerListPath;
}
