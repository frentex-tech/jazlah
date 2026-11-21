// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_cutting_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductCuttingResponseDto _$ProductCuttingResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductCuttingResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['cuttingStyleId', 'name', 'extraPriceHalalas'],
  );
  final val = ProductCuttingResponseDto(
    cuttingStyleId: $checkedConvert('cuttingStyleId', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => v == null
          ? null
          : LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    extraPriceHalalas: $checkedConvert('extraPriceHalalas', (v) => v as num),
  );
  return val;
});

Map<String, dynamic> _$ProductCuttingResponseDtoToJson(
  ProductCuttingResponseDto instance,
) => <String, dynamic>{
  'cuttingStyleId': instance.cuttingStyleId,
  'name': instance.name?.toJson(),
  'extraPriceHalalas': instance.extraPriceHalalas,
};
