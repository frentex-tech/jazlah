// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'set_product_availability_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SetProductAvailabilityDto _$SetProductAvailabilityDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('SetProductAvailabilityDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['isAvailable']);
  final val = SetProductAvailabilityDto(
    isAvailable: $checkedConvert('isAvailable', (v) => v as bool),
    sizes: $checkedConvert(
      'sizes',
      (v) => (v as List<dynamic>?)
          ?.map((e) => SizeAvailabilityDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$SetProductAvailabilityDtoToJson(
  SetProductAvailabilityDto instance,
) => <String, dynamic>{
  'isAvailable': instance.isAvailable,
  'sizes': ?instance.sizes?.map((e) => e.toJson()).toList(),
};
