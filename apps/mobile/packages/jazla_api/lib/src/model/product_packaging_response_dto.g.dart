// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_packaging_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductPackagingResponseDto _$ProductPackagingResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductPackagingResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['packaging', 'extraPriceHalalas']);
  final val = ProductPackagingResponseDto(
    packaging: $checkedConvert(
      'packaging',
      (v) => $enumDecode(
        _$ProductPackagingResponseDtoPackagingEnumEnumMap,
        v,
        unknownValue:
            ProductPackagingResponseDtoPackagingEnum.unknownDefaultOpenApi,
      ),
    ),
    extraPriceHalalas: $checkedConvert('extraPriceHalalas', (v) => v as num),
  );
  return val;
});

Map<String, dynamic> _$ProductPackagingResponseDtoToJson(
  ProductPackagingResponseDto instance,
) => <String, dynamic>{
  'packaging':
      _$ProductPackagingResponseDtoPackagingEnumEnumMap[instance.packaging]!,
  'extraPriceHalalas': instance.extraPriceHalalas,
};

const _$ProductPackagingResponseDtoPackagingEnumEnumMap = {
  ProductPackagingResponseDtoPackagingEnum.trays: 'trays',
  ProductPackagingResponseDtoPackagingEnum.bags: 'bags',
  ProductPackagingResponseDtoPackagingEnum.vacuum: 'vacuum',
  ProductPackagingResponseDtoPackagingEnum.none: 'none',
  ProductPackagingResponseDtoPackagingEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
