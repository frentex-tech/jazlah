// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cutting_price_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CuttingPriceDto _$CuttingPriceDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CuttingPriceDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['cuttingStyleId', 'extraPriceHalalas']);
  final val = CuttingPriceDto(
    cuttingStyleId: $checkedConvert('cuttingStyleId', (v) => v as String),
    extraPriceHalalas: $checkedConvert('extraPriceHalalas', (v) => v as num),
  );
  return val;
});

Map<String, dynamic> _$CuttingPriceDtoToJson(CuttingPriceDto instance) =>
    <String, dynamic>{
      'cuttingStyleId': instance.cuttingStyleId,
      'extraPriceHalalas': instance.extraPriceHalalas,
    };
