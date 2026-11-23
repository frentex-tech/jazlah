import type { ProductCard } from '../application/product-card.type';
import type { ProductCardResponseDto } from './dto/product-card-response.dto';

export function toProductCardResponse(
  card: ProductCard,
): ProductCardResponseDto {
  const { summary } = card;
  return {
    id: summary.id,
    vendor: { id: summary.vendorId, name: card.vendorName },
    name: summary.name,
    categoryId: summary.categoryId,
    meatTypeId: summary.meatTypeId,
    status: summary.status,
    isAvailable: summary.isAvailable,
    minPriceHalalas: summary.minPrice?.halalas ?? null,
    coverUrl: card.coverUrl,
    createdAt: summary.createdAt,
  };
}
