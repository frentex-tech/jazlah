// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'default_capacity_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DefaultCapacityDto _$DefaultCapacityDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('DefaultCapacityDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['ordersPerDay', 'carcassesPerDay']);
      final val = DefaultCapacityDto(
        ordersPerDay: $checkedConvert(
          'ordersPerDay',
          (v) => (v as num).toInt(),
        ),
        carcassesPerDay: $checkedConvert(
          'carcassesPerDay',
          (v) => (v as num).toInt(),
        ),
      );
      return val;
    });

Map<String, dynamic> _$DefaultCapacityDtoToJson(DefaultCapacityDto instance) =>
    <String, dynamic>{
      'ordersPerDay': instance.ordersPerDay,
      'carcassesPerDay': instance.carcassesPerDay,
    };
