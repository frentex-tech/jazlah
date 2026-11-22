// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_product_size_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PublicProductSizeResponseDto _$PublicProductSizeResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PublicProductSizeResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'approxWeightGrams',
      'priceHalalas',
      'tag',
      'isAvailable',
    ],
  );
  final val = PublicProductSizeResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    approxWeightGrams: $checkedConvert('approxWeightGrams', (v) => v as num),
    priceHalalas: $checkedConvert('priceHalalas', (v) => v as num),
    tag: $checkedConvert(
      'tag',
      (v) => v == null
          ? null
          : LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    isAvailable: $checkedConvert('isAvailable', (v) => v as bool),
  );
  return val;
});

Map<String, dynamic> _$PublicProductSizeResponseDtoToJson(
  PublicProductSizeResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'approxWeightGrams': instance.approxWeightGrams,
  'priceHalalas': instance.priceHalalas,
  'tag': instance.tag?.toJson(),
  'isAvailable': instance.isAvailable,
};
