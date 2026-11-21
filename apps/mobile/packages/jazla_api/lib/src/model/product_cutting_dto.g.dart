// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_cutting_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductCuttingDto _$ProductCuttingDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductCuttingDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['cuttingStyleId', 'extraPriceHalalas']);
  final val = ProductCuttingDto(
    cuttingStyleId: $checkedConvert('cuttingStyleId', (v) => v as String),
    extraPriceHalalas: $checkedConvert('extraPriceHalalas', (v) => v as num),
  );
  return val;
});

Map<String, dynamic> _$ProductCuttingDtoToJson(ProductCuttingDto instance) =>
    <String, dynamic>{
      'cuttingStyleId': instance.cuttingStyleId,
      'extraPriceHalalas': instance.extraPriceHalalas,
    };
