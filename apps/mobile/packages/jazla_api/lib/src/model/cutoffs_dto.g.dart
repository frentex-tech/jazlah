// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cutoffs_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CutoffsDto _$CutoffsDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('CutoffsDto', json, ($checkedConvert) {
      $checkKeys(
        json,
        requiredKeys: const [
          'readyMeat',
          'carcass',
          'cooked',
          'occasion',
          'adha',
        ],
      );
      final val = CutoffsDto(
        readyMeat: $checkedConvert(
          'readyMeat',
          (v) => CutoffRuleDto.fromJson(v as Map<String, dynamic>),
        ),
        carcass: $checkedConvert(
          'carcass',
          (v) => CutoffRuleDto.fromJson(v as Map<String, dynamic>),
        ),
        cooked: $checkedConvert(
          'cooked',
          (v) => CutoffRuleDto.fromJson(v as Map<String, dynamic>),
        ),
        occasion: $checkedConvert(
          'occasion',
          (v) => CutoffRuleDto.fromJson(v as Map<String, dynamic>),
        ),
        adha: $checkedConvert(
          'adha',
          (v) => CutoffRuleDto.fromJson(v as Map<String, dynamic>),
        ),
      );
      return val;
    });

Map<String, dynamic> _$CutoffsDtoToJson(CutoffsDto instance) =>
    <String, dynamic>{
      'readyMeat': instance.readyMeat.toJson(),
      'carcass': instance.carcass.toJson(),
      'cooked': instance.cooked.toJson(),
      'occasion': instance.occasion.toJson(),
      'adha': instance.adha.toJson(),
    };
