// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_product_cutting_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PublicProductCuttingResponseDto _$PublicProductCuttingResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PublicProductCuttingResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['cuttingStyleId', 'name', 'extraPriceHalalas'],
  );
  final val = PublicProductCuttingResponseDto(
    cuttingStyleId: $checkedConvert('cuttingStyleId', (v) => v as String),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    extraPriceHalalas: $checkedConvert('extraPriceHalalas', (v) => v as num),
  );
  return val;
});

Map<String, dynamic> _$PublicProductCuttingResponseDtoToJson(
  PublicProductCuttingResponseDto instance,
) => <String, dynamic>{
  'cuttingStyleId': instance.cuttingStyleId,
  'name': instance.name.toJson(),
  'extraPriceHalalas': instance.extraPriceHalalas,
};
