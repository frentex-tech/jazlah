// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_card_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductCardPageResponseDto _$ProductCardPageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductCardPageResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
  final val = ProductCardPageResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) => ProductCardResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$ProductCardPageResponseDtoToJson(
  ProductCardPageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
