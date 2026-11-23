// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_change_request_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductChangeRequestPageResponseDto
_$ProductChangeRequestPageResponseDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ProductChangeRequestPageResponseDto', json, (
      $checkedConvert,
    ) {
      $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
      final val = ProductChangeRequestPageResponseDto(
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map(
                (e) => ProductChangeRequestResponseDto.fromJson(
                  e as Map<String, dynamic>,
                ),
              )
              .toList(),
        ),
        nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$ProductChangeRequestPageResponseDtoToJson(
  ProductChangeRequestPageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
