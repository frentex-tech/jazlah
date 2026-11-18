// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_reference_item_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CreateReferenceItemDto _$CreateReferenceItemDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CreateReferenceItemDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['name']);
  final val = CreateReferenceItemDto(
    name: $checkedConvert(
      'name',
      (v) => LocalizedNameDto.fromJson(v as Map<String, dynamic>),
    ),
    sortOrder: $checkedConvert('sortOrder', (v) => v as num?),
    imageMediaId: $checkedConvert('imageMediaId', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$CreateReferenceItemDtoToJson(
  CreateReferenceItemDto instance,
) => <String, dynamic>{
  'name': instance.name.toJson(),
  'sortOrder': ?instance.sortOrder,
  'imageMediaId': ?instance.imageMediaId,
};
