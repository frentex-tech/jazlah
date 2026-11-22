// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'set_ordering_pause_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SetOrderingPauseDto _$SetOrderingPauseDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('SetOrderingPauseDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['isPaused']);
      final val = SetOrderingPauseDto(
        isPaused: $checkedConvert('isPaused', (v) => v as bool),
        messageAr: $checkedConvert('messageAr', (v) => v as String?),
        messageEn: $checkedConvert('messageEn', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$SetOrderingPauseDtoToJson(
  SetOrderingPauseDto instance,
) => <String, dynamic>{
  'isPaused': instance.isPaused,
  'messageAr': ?instance.messageAr,
  'messageEn': ?instance.messageEn,
};
