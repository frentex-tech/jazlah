// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'client_settings_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ClientSettingsResponseDto _$ClientSettingsResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ClientSettingsResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'deliveryWindow',
      'bookingHorizonDays',
      'minOrderHalalas',
      'deliveryFeeHalalas',
      'codEnabled',
      'codMaxOrderHalalas',
      'paused',
    ],
  );
  final val = ClientSettingsResponseDto(
    deliveryWindow: $checkedConvert(
      'deliveryWindow',
      (v) => TimeWindowDto.fromJson(v as Map<String, dynamic>),
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
    codEnabled: $checkedConvert('codEnabled', (v) => v as bool),
    codMaxOrderHalalas: $checkedConvert(
      'codMaxOrderHalalas',
      (v) => (v as num?)?.toInt(),
    ),
    paused: $checkedConvert(
      'paused',
      (v) => OrderingPauseResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$ClientSettingsResponseDtoToJson(
  ClientSettingsResponseDto instance,
) => <String, dynamic>{
  'deliveryWindow': instance.deliveryWindow.toJson(),
  'bookingHorizonDays': instance.bookingHorizonDays,
  'minOrderHalalas': instance.minOrderHalalas,
  'deliveryFeeHalalas': instance.deliveryFeeHalalas,
  'codEnabled': instance.codEnabled,
  'codMaxOrderHalalas': instance.codMaxOrderHalalas,
  'paused': instance.paused.toJson(),
};
