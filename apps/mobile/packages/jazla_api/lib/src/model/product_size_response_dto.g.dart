// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_size_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductSizeResponseDto _$ProductSizeResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductSizeResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['id', 'approxWeightGrams', 'priceHalalas', 'tag'],
  );
  final val = ProductSizeResponseDto(
    id: $checkedConvert('id', (v) => v as String?),
    approxWeightGrams: $checkedConvert('approxWeightGrams', (v) => v as num),
    priceHalalas: $checkedConvert('priceHalalas', (v) => v as num),
    tag: $checkedConvert(
      'tag',
      (v) => v == null
          ? null
          : LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$ProductSizeResponseDtoToJson(
  ProductSizeResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'approxWeightGrams': instance.approxWeightGrams,
  'priceHalalas': instance.priceHalalas,
  'tag': instance.tag?.toJson(),
};
