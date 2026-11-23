// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'closed_day_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ClosedDayDto _$ClosedDayDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('ClosedDayDto', json, ($checkedConvert) {
      $checkKeys(
        json,
        requiredKeys: const ['date', 'scope', 'reasonAr', 'reasonEn'],
      );
      final val = ClosedDayDto(
        date: $checkedConvert('date', (v) => v as String),
        scope: $checkedConvert(
          'scope',
          (v) => $enumDecode(
            _$ClosedDayDtoScopeEnumEnumMap,
            v,
            unknownValue: ClosedDayDtoScopeEnum.unknownDefaultOpenApi,
          ),
        ),
        reasonAr: $checkedConvert('reasonAr', (v) => v as String),
        reasonEn: $checkedConvert('reasonEn', (v) => v as String),
      );
      return val;
    });

Map<String, dynamic> _$ClosedDayDtoToJson(ClosedDayDto instance) =>
    <String, dynamic>{
      'date': instance.date,
      'scope': _$ClosedDayDtoScopeEnumEnumMap[instance.scope]!,
      'reasonAr': instance.reasonAr,
      'reasonEn': instance.reasonEn,
    };

const _$ClosedDayDtoScopeEnumEnumMap = {
  ClosedDayDtoScopeEnum.both: 'both',
  ClosedDayDtoScopeEnum.delivery: 'delivery',
  ClosedDayDtoScopeEnum.pickup: 'pickup',
  ClosedDayDtoScopeEnum.unknownDefaultOpenApi: 'unknown_default_open_api',
};
