// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'size_availability_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SizeAvailabilityDto _$SizeAvailabilityDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('SizeAvailabilityDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['sizeId', 'isAvailable']);
      final val = SizeAvailabilityDto(
        sizeId: $checkedConvert('sizeId', (v) => v as String),
        isAvailable: $checkedConvert('isAvailable', (v) => v as bool),
      );
      return val;
    });

Map<String, dynamic> _$SizeAvailabilityDtoToJson(
  SizeAvailabilityDto instance,
) => <String, dynamic>{
  'sizeId': instance.sizeId,
  'isAvailable': instance.isAvailable,
};
