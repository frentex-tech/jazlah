// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductResponseDto _$ProductResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'vendorId',
      'status',
      'isAvailable',
      'fulfilment',
      'name',
      'description',
      'category',
      'meatType',
      'images',
      'sizes',
      'cuttings',
      'packagings',
      'exclusions',
      'minPriceHalalas',
      'rejectionReason',
      'submittedAt',
      'reviewedAt',
      'publishedAt',
      'createdAt',
      'updatedAt',
      'changeRequest',
    ],
  );
  final val = ProductResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    vendorId: $checkedConvert('vendorId', (v) => v as String),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$ProductResponseDtoStatusEnumEnumMap,
        v,
        unknownValue: ProductResponseDtoStatusEnum.unknownDefaultOpenApi,
      ),
    ),
    isAvailable: $checkedConvert('isAvailable', (v) => v as bool),
    fulfilment: $checkedConvert(
      'fulfilment',
      (v) => $enumDecode(
        _$ProductResponseDtoFulfilmentEnumEnumMap,
        v,
        unknownValue: ProductResponseDtoFulfilmentEnum.unknownDefaultOpenApi,
      ),
    ),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    description: $checkedConvert(
      'description',
      (v) =>
          OptionalLocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    category: $checkedConvert(
      'category',
      (v) => NamedReferenceResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    meatType: $checkedConvert(
      'meatType',
      (v) => v == null
          ? null
          : NamedReferenceResponseDto.fromJson(v as Map<String, dynamic>),
    ),
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
    exclusions: $checkedConvert(
      'exclusions',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                NamedReferenceResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    minPriceHalalas: $checkedConvert('minPriceHalalas', (v) => v as num?),
    rejectionReason: $checkedConvert('rejectionReason', (v) => v as String?),
    submittedAt: $checkedConvert(
      'submittedAt',
      (v) => v == null ? null : DateTime.parse(v as String),
    ),
    reviewedAt: $checkedConvert(
      'reviewedAt',
      (v) => v == null ? null : DateTime.parse(v as String),
    ),
    publishedAt: $checkedConvert(
      'publishedAt',
      (v) => v == null ? null : DateTime.parse(v as String),
    ),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
    updatedAt: $checkedConvert('updatedAt', (v) => DateTime.parse(v as String)),
    changeRequest: $checkedConvert(
      'changeRequest',
      (v) => v == null
          ? null
          : ProductChangeRequestResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$ProductResponseDtoToJson(
  ProductResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'vendorId': instance.vendorId,
  'status': _$ProductResponseDtoStatusEnumEnumMap[instance.status]!,
  'isAvailable': instance.isAvailable,
  'fulfilment': _$ProductResponseDtoFulfilmentEnumEnumMap[instance.fulfilment]!,
  'name': instance.name.toJson(),
  'description': instance.description.toJson(),
  'category': instance.category.toJson(),
  'meatType': instance.meatType?.toJson(),
  'images': instance.images.map((e) => e.toJson()).toList(),
  'sizes': instance.sizes.map((e) => e.toJson()).toList(),
  'cuttings': instance.cuttings.map((e) => e.toJson()).toList(),
  'packagings': instance.packagings.map((e) => e.toJson()).toList(),
  'exclusions': instance.exclusions.map((e) => e.toJson()).toList(),
  'minPriceHalalas': instance.minPriceHalalas,
  'rejectionReason': instance.rejectionReason,
  'submittedAt': instance.submittedAt?.toIso8601String(),
  'reviewedAt': instance.reviewedAt?.toIso8601String(),
  'publishedAt': instance.publishedAt?.toIso8601String(),
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
  'changeRequest': instance.changeRequest?.toJson(),
};

const _$ProductResponseDtoStatusEnumEnumMap = {
  ProductResponseDtoStatusEnum.draft: 'draft',
  ProductResponseDtoStatusEnum.pendingReview: 'pending_review',
  ProductResponseDtoStatusEnum.published: 'published',
  ProductResponseDtoStatusEnum.rejected: 'rejected',
  ProductResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};

const _$ProductResponseDtoFulfilmentEnumEnumMap = {
  ProductResponseDtoFulfilmentEnum.delivery: 'delivery',
  ProductResponseDtoFulfilmentEnum.pickup: 'pickup',
  ProductResponseDtoFulfilmentEnum.both: 'both',
  ProductResponseDtoFulfilmentEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
