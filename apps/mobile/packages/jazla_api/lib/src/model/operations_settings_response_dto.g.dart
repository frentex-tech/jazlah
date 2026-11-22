// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'operations_settings_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OperationsSettingsResponseDto _$OperationsSettingsResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OperationsSettingsResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'deliveryWindow',
      'cutoffs',
      'defaultCapacity',
      'cod',
      'bookingHorizonDays',
      'minOrderHalalas',
      'deliveryFeeHalalas',
      'complaintWindowHours',
      'closedDays',
      'paused',
      'updatedAt',
    ],
  );
  final val = OperationsSettingsResponseDto(
    deliveryWindow: $checkedConvert(
      'deliveryWindow',
      (v) => TimeWindowDto.fromJson(v as Map<String, dynamic>),
    ),
    cutoffs: $checkedConvert(
      'cutoffs',
      (v) => CutoffsDto.fromJson(v as Map<String, dynamic>),
    ),
    defaultCapacity: $checkedConvert(
      'defaultCapacity',
      (v) => DefaultCapacityDto.fromJson(v as Map<String, dynamic>),
    ),
    cod: $checkedConvert(
      'cod',
      (v) => CodSettingsDto.fromJson(v as Map<String, dynamic>),
    ),
    bookingHorizonDays: $checkedConvert(
      'bookingHorizonDays',
      (v) => (v as num).toInt(),
    ),
    minOrderHalalas: $checkedConvert(
      'minOrderHalalas',
      (v) => (v as num).toInt(),
    ),
    deliveryFeeHalalas: $checkedConvert(
      'deliveryFeeHalalas',
      (v) => (v as num).toInt(),
    ),
    complaintWindowHours: $checkedConvert(
      'complaintWindowHours',
      (v) => (v as num).toInt(),
    ),
    closedDays: $checkedConvert(
      'closedDays',
      (v) => (v as List<dynamic>)
          .map((e) => ClosedDayDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
    paused: $checkedConvert(
      'paused',
      (v) => OrderingPauseResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    updatedAt: $checkedConvert('updatedAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$OperationsSettingsResponseDtoToJson(
  OperationsSettingsResponseDto instance,
) => <String, dynamic>{
  'deliveryWindow': instance.deliveryWindow.toJson(),
  'cutoffs': instance.cutoffs.toJson(),
  'defaultCapacity': instance.defaultCapacity.toJson(),
  'cod': instance.cod.toJson(),
  'bookingHorizonDays': instance.bookingHorizonDays,
  'minOrderHalalas': instance.minOrderHalalas,
  'deliveryFeeHalalas': instance.deliveryFeeHalalas,
  'complaintWindowHours': instance.complaintWindowHours,
  'closedDays': instance.closedDays.map((e) => e.toJson()).toList(),
  'paused': instance.paused.toJson(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};
