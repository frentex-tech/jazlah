import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import { PRODUCT_PACKAGINGS } from '../../domain/product-packagings.constants';
import type { ProductPackaging } from '../../domain/product-packaging.type';

/** A new global rule: this cutting style cannot be packed this way. */
export class CreateCuttingPackagingIncompatibilityDto {
  @ApiProperty({
    format: 'uuid',
    example: '7f3a2c1e-0b9d-4e5f-8a6b-1c2d3e4f5a6b',
    description:
      'The id (UUID) of an active cutting style (GET /v1/admin/lists/cutting-styles); another one is VALIDATION_FAILED `isActiveCuttingStyle`.',
  })
  @IsUUID()
  cuttingStyleId!: string;

  @ApiProperty({
    enum: PRODUCT_PACKAGINGS,
    example: 'vacuum',
    description:
      'The packaging this cutting style cannot be packed in: `trays`, `bags`, `vacuum` or `none`.',
  })
  @IsIn(PRODUCT_PACKAGINGS)
  packaging!: ProductPackaging;
}
