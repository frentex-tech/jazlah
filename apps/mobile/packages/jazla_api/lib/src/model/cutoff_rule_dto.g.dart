// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cutoff_rule_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CutoffRuleDto _$CutoffRuleDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CutoffRuleDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['time', 'leadDays']);
      final val = CutoffRuleDto(
        time: $checkedConvert('time', (v) => v as String?),
        leadDays: $checkedConvert('leadDays', (v) => (v as num).toInt()),
      );
      return val;
    });

Map<String, dynamic> _$CutoffRuleDtoToJson(CutoffRuleDto instance) =>
    <String, dynamic>{'time': instance.time, 'leadDays': instance.leadDays};
