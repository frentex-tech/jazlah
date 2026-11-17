import type { ReferenceItemView } from '../application/reference-item-view.type';
import type { ReferenceItemResponseDto } from './dto/reference-item-response.dto';

/** A list entry with its image URL as the response shape. */
export function toReferenceItemResponse({
  item,
  imageUrl,
}: ReferenceItemView): ReferenceItemResponseDto {
  return {
    id: item.id,
    name: item.name,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
    imageUrl,
    createdAt: item.createdAt,
  };
}
