// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'set_vendor_capacity_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SetVendorCapacityDto _$SetVendorCapacityDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('SetVendorCapacityDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['ordersPerDay', 'carcassesPerDay']);
  final val = SetVendorCapacityDto(
    ordersPerDay: $checkedConvert('ordersPerDay', (v) => (v as num?)?.toInt()),
    carcassesPerDay: $checkedConvert(
      'carcassesPerDay',
      (v) => (v as num?)?.toInt(),
    ),
  );
  return val;
});

Map<String, dynamic> _$SetVendorCapacityDtoToJson(
  SetVendorCapacityDto instance,
) => <String, dynamic>{
  'ordersPerDay': instance.ordersPerDay,
  'carcassesPerDay': instance.carcassesPerDay,
};
