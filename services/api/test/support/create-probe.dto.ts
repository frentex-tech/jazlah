import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

/** Request body for the probe endpoint that exercises validation. Test-only. */
export class CreateProbeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
