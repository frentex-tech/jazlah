// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_reference_item_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateReferenceItemDto _$UpdateReferenceItemDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('UpdateReferenceItemDto', json, ($checkedConvert) {
  final val = UpdateReferenceItemDto(
    name: $checkedConvert(
      'name',
      (v) => v == null
          ? null
          : LocalizedNameDto.fromJson(v as Map<String, dynamic>),
    ),
    isActive: $checkedConvert('isActive', (v) => v as bool?),
    sortOrder: $checkedConvert('sortOrder', (v) => v as num?),
    imageMediaId: $checkedConvert('imageMediaId', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$UpdateReferenceItemDtoToJson(
  UpdateReferenceItemDto instance,
) => <String, dynamic>{
  'name': ?instance.name?.toJson(),
  'isActive': ?instance.isActive,
  'sortOrder': ?instance.sortOrder,
  'imageMediaId': ?instance.imageMediaId,
};
