// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reference_item_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ReferenceItemPageResponseDto _$ReferenceItemPageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ReferenceItemPageResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
  final val = ReferenceItemPageResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) => ReferenceItemResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$ReferenceItemPageResponseDtoToJson(
  ReferenceItemPageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
