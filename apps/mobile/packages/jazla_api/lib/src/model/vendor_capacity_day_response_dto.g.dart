// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_capacity_day_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorCapacityDayResponseDto _$VendorCapacityDayResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('VendorCapacityDayResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'date',
      'ordersLimit',
      'carcassesLimit',
      'ordersBooked',
      'carcassesBooked',
    ],
  );
  final val = VendorCapacityDayResponseDto(
    date: $checkedConvert('date', (v) => v as String),
    ordersLimit: $checkedConvert('ordersLimit', (v) => (v as num?)?.toInt()),
    carcassesLimit: $checkedConvert(
      'carcassesLimit',
      (v) => (v as num?)?.toInt(),
    ),
    ordersBooked: $checkedConvert('ordersBooked', (v) => (v as num).toInt()),
    carcassesBooked: $checkedConvert(
      'carcassesBooked',
      (v) => (v as num).toInt(),
    ),
  );
  return val;
});

Map<String, dynamic> _$VendorCapacityDayResponseDtoToJson(
  VendorCapacityDayResponseDto instance,
) => <String, dynamic>{
  'date': instance.date,
  'ordersLimit': instance.ordersLimit,
  'carcassesLimit': instance.carcassesLimit,
  'ordersBooked': instance.ordersBooked,
  'carcassesBooked': instance.carcassesBooked,
};
