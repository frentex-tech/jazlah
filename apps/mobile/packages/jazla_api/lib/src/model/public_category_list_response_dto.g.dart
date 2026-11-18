// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_category_list_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PublicCategoryListResponseDto _$PublicCategoryListResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PublicCategoryListResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items']);
  final val = PublicCategoryListResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) => ReferenceItemResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$PublicCategoryListResponseDtoToJson(
  PublicCategoryListResponseDto instance,
) => <String, dynamic>{'items': instance.items.map((e) => e.toJson()).toList()};
