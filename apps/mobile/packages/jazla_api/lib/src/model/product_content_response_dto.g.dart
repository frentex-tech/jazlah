// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_content_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductContentResponseDto _$ProductContentResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductContentResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'name',
      'description',
      'categoryId',
      'meatTypeId',
      'images',
      'sizes',
      'cuttings',
      'packagings',
      'exclusionItemIds',
    ],
  );
  final val = ProductContentResponseDto(
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    description: $checkedConvert(
      'description',
      (v) =>
          OptionalLocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    categoryId: $checkedConvert('categoryId', (v) => v as String),
    meatTypeId: $checkedConvert('meatTypeId', (v) => v as String?),
    images: $checkedConvert(
      'images',
      (v) => (v as List<dynamic>)
          .map(
            (e) => ProductImageResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    sizes: $checkedConvert(
      'sizes',
      (v) => (v as List<dynamic>)
          .map(
            (e) => ProductSizeResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    cuttings: $checkedConvert(
      'cuttings',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                ProductCuttingResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    packagings: $checkedConvert(
      'packagings',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                ProductPackagingResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    exclusionItemIds: $checkedConvert(
      'exclusionItemIds',
      (v) => (v as List<dynamic>).map((e) => e as String).toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$ProductContentResponseDtoToJson(
  ProductContentResponseDto instance,
) => <String, dynamic>{
  'name': instance.name.toJson(),
  'description': instance.description.toJson(),
  'categoryId': instance.categoryId,
  'meatTypeId': instance.meatTypeId,
  'images': instance.images.map((e) => e.toJson()).toList(),
  'sizes': instance.sizes.map((e) => e.toJson()).toList(),
  'cuttings': instance.cuttings.map((e) => e.toJson()).toList(),
  'packagings': instance.packagings.map((e) => e.toJson()).toList(),
  'exclusionItemIds': instance.exclusionItemIds,
};
