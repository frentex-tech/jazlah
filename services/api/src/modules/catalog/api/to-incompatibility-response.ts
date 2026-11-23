import type { CuttingPackagingIncompatibility } from '../domain/cutting-packaging-incompatibility.type';
import type { CuttingPackagingIncompatibilityResponseDto } from './dto/cutting-packaging-incompatibility-response.dto';

export function toIncompatibilityResponse(
  rule: CuttingPackagingIncompatibility,
): CuttingPackagingIncompatibilityResponseDto {
  return {
    id: rule.id,
    cuttingStyleId: rule.cuttingStyleId,
    packaging: rule.packaging,
    createdAt: rule.createdAt,
  };
}
