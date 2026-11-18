import type { CoveringZone } from './covering-zone.type';
import type { CoverageCheckResponseDto } from './dto/coverage-check-response.dto';

/** The answer of the coverage check. */
export function toCoverageCheckResponse(
  zone: CoveringZone | null,
): CoverageCheckResponseDto {
  return {
    covered: zone !== null,
    zone:
      zone === null
        ? null
        : {
            id: zone.id,
            name: { ar: zone.name.ar, en: zone.name.en },
            city: zone.city,
          },
  };
}
