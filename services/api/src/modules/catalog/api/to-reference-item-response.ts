import type { ReferenceItem } from '../domain/reference-item.type';
import type { ReferenceItemResponseDto } from './dto/reference-item-response.dto';

export function toReferenceItemResponse(
  item: ReferenceItem,
): ReferenceItemResponseDto {
  return {
    id: item.id,
    name: item.name,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
  };
}
