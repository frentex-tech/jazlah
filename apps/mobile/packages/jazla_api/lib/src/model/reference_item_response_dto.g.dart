// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reference_item_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ReferenceItemResponseDto _$ReferenceItemResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ReferenceItemResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'name',
      'isActive',
      'sortOrder',
      'imageUrl',
      'createdAt',
    ],
  );
  final val = ReferenceItemResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    isActive: $checkedConvert('isActive', (v) => v as bool),
    sortOrder: $checkedConvert('sortOrder', (v) => v as num?),
    imageUrl: $checkedConvert('imageUrl', (v) => v as String?),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$ReferenceItemResponseDtoToJson(
  ReferenceItemResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name.toJson(),
  'isActive': instance.isActive,
  'sortOrder': instance.sortOrder,
  'imageUrl': instance.imageUrl,
  'createdAt': instance.createdAt.toIso8601String(),
};
