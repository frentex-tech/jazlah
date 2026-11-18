// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_card_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductCardResponseDto _$ProductCardResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductCardResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'vendor',
      'name',
      'categoryId',
      'meatTypeId',
      'status',
      'isAvailable',
      'minPriceHalalas',
      'coverUrl',
      'createdAt',
    ],
  );
  final val = ProductCardResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    vendor: $checkedConvert(
      'vendor',
      (v) => ProductVendorResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    categoryId: $checkedConvert('categoryId', (v) => v as String),
    meatTypeId: $checkedConvert('meatTypeId', (v) => v as String?),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$ProductCardResponseDtoStatusEnumEnumMap,
        v,
        unknownValue: ProductCardResponseDtoStatusEnum.unknownDefaultOpenApi,
      ),
    ),
    isAvailable: $checkedConvert('isAvailable', (v) => v as bool),
    minPriceHalalas: $checkedConvert('minPriceHalalas', (v) => v as num?),
    coverUrl: $checkedConvert('coverUrl', (v) => v as String?),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$ProductCardResponseDtoToJson(
  ProductCardResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'vendor': instance.vendor.toJson(),
  'name': instance.name.toJson(),
  'categoryId': instance.categoryId,
  'meatTypeId': instance.meatTypeId,
  'status': _$ProductCardResponseDtoStatusEnumEnumMap[instance.status]!,
  'isAvailable': instance.isAvailable,
  'minPriceHalalas': instance.minPriceHalalas,
  'coverUrl': instance.coverUrl,
  'createdAt': instance.createdAt.toIso8601String(),
};

const _$ProductCardResponseDtoStatusEnumEnumMap = {
  ProductCardResponseDtoStatusEnum.draft: 'draft',
  ProductCardResponseDtoStatusEnum.pendingReview: 'pending_review',
  ProductCardResponseDtoStatusEnum.published: 'published',
  ProductCardResponseDtoStatusEnum.rejected: 'rejected',
  ProductCardResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
