// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'time_window_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

TimeWindowDto _$TimeWindowDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('TimeWindowDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['start', 'end']);
      final val = TimeWindowDto(
        start: $checkedConvert('start', (v) => v as String),
        end: $checkedConvert('end', (v) => v as String),
      );
      return val;
    });

Map<String, dynamic> _$TimeWindowDtoToJson(TimeWindowDto instance) =>
    <String, dynamic>{'start': instance.start, 'end': instance.end};
