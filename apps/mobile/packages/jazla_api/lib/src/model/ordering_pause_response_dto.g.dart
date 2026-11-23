// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ordering_pause_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderingPauseResponseDto _$OrderingPauseResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderingPauseResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['isPaused', 'messageAr', 'messageEn']);
  final val = OrderingPauseResponseDto(
    isPaused: $checkedConvert('isPaused', (v) => v as bool),
    messageAr: $checkedConvert('messageAr', (v) => v as String?),
    messageEn: $checkedConvert('messageEn', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$OrderingPauseResponseDtoToJson(
  OrderingPauseResponseDto instance,
) => <String, dynamic>{
  'isPaused': instance.isPaused,
  'messageAr': instance.messageAr,
  'messageEn': instance.messageEn,
};
