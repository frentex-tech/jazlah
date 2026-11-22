// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_operations_settings_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateOperationsSettingsDto _$UpdateOperationsSettingsDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('UpdateOperationsSettingsDto', json, ($checkedConvert) {
  final val = UpdateOperationsSettingsDto(
    deliveryWindow: $checkedConvert(
      'deliveryWindow',
      (v) =>
          v == null ? null : TimeWindowDto.fromJson(v as Map<String, dynamic>),
    ),
    cutoffs: $checkedConvert(
      'cutoffs',
      (v) => v == null ? null : CutoffsDto.fromJson(v as Map<String, dynamic>),
    ),
    defaultCapacity: $checkedConvert(
      'defaultCapacity',
      (v) => v == null
          ? null
          : DefaultCapacityDto.fromJson(v as Map<String, dynamic>),
    ),
    cod: $checkedConvert(
      'cod',
      (v) =>
          v == null ? null : CodSettingsDto.fromJson(v as Map<String, dynamic>),
    ),
    bookingHorizonDays: $checkedConvert(
      'bookingHorizonDays',
      (v) => (v as num?)?.toInt(),
    ),
    minOrderHalalas: $checkedConvert(
      'minOrderHalalas',
      (v) => (v as num?)?.toInt(),
    ),
    deliveryFeeHalalas: $checkedConvert(
      'deliveryFeeHalalas',
      (v) => (v as num?)?.toInt(),
    ),
    complaintWindowHours: $checkedConvert(
      'complaintWindowHours',
      (v) => (v as num?)?.toInt(),
    ),
    closedDays: $checkedConvert(
      'closedDays',
      (v) => (v as List<dynamic>?)
          ?.map((e) => ClosedDayDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$UpdateOperationsSettingsDtoToJson(
  UpdateOperationsSettingsDto instance,
) => <String, dynamic>{
  'deliveryWindow': ?instance.deliveryWindow?.toJson(),
  'cutoffs': ?instance.cutoffs?.toJson(),
  'defaultCapacity': ?instance.defaultCapacity?.toJson(),
  'cod': ?instance.cod?.toJson(),
  'bookingHorizonDays': ?instance.bookingHorizonDays,
  'minOrderHalalas': ?instance.minOrderHalalas,
  'deliveryFeeHalalas': ?instance.deliveryFeeHalalas,
  'complaintWindowHours': ?instance.complaintWindowHours,
  'closedDays': ?instance.closedDays?.map((e) => e.toJson()).toList(),
};
