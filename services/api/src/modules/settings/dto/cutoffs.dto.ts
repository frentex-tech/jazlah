import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { CutoffRuleDto } from './cutoff-rule.dto';

/** The cut-off rule of each kind of order (a `mixed` cart takes the latest earliest day of its kinds). */
export class CutoffsDto {
  @ApiProperty({
    type: CutoffRuleDto,
    description: 'Ready meat (`ready_meat`); default 12:00, 0 days.',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => CutoffRuleDto)
  readyMeat!: CutoffRuleDto;

  @ApiProperty({
    type: CutoffRuleDto,
    description: 'Whole carcasses (`carcass`); default 20:00, 1 day.',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => CutoffRuleDto)
  carcass!: CutoffRuleDto;

  @ApiProperty({
    type: CutoffRuleDto,
    description: 'Cooked food (`cooked`); default 18:00, 1 day.',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => CutoffRuleDto)
  cooked!: CutoffRuleDto;

  @ApiProperty({
    type: CutoffRuleDto,
    description: 'Occasion packages (`occasion`); default no time, 3 days.',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => CutoffRuleDto)
  occasion!: CutoffRuleDto;

  @ApiProperty({
    type: CutoffRuleDto,
    description:
      'Eid al-Adha sacrifices (`adha`); default no time, 3 days, until the Adha calendar lands (Sprint 6).',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => CutoffRuleDto)
  adha!: CutoffRuleDto;
}
