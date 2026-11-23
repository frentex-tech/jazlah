// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_size_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductSizeDto _$ProductSizeDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductSizeDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['approxWeightGrams', 'priceHalalas']);
  final val = ProductSizeDto(
    id: $checkedConvert('id', (v) => v as String?),
    approxWeightGrams: $checkedConvert('approxWeightGrams', (v) => v as num),
    priceHalalas: $checkedConvert('priceHalalas', (v) => v as num),
    tag: $checkedConvert(
      'tag',
      (v) => v == null
          ? null
          : LocalizedNameDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$ProductSizeDtoToJson(ProductSizeDto instance) =>
    <String, dynamic>{
      'id': ?instance.id,
      'approxWeightGrams': instance.approxWeightGrams,
      'priceHalalas': instance.priceHalalas,
      'tag': ?instance.tag?.toJson(),
    };
