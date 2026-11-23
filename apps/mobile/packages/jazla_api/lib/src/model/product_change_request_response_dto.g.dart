// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_change_request_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductChangeRequestResponseDto _$ProductChangeRequestResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductChangeRequestResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'productId',
      'status',
      'content',
      'rejectionReason',
      'createdAt',
      'updatedAt',
      'reviewedAt',
    ],
  );
  final val = ProductChangeRequestResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    productId: $checkedConvert('productId', (v) => v as String),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$ProductChangeRequestResponseDtoStatusEnumEnumMap,
        v,
        unknownValue:
            ProductChangeRequestResponseDtoStatusEnum.unknownDefaultOpenApi,
      ),
    ),
    content: $checkedConvert(
      'content',
      (v) => ProductContentResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    rejectionReason: $checkedConvert('rejectionReason', (v) => v as String?),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
    updatedAt: $checkedConvert('updatedAt', (v) => DateTime.parse(v as String)),
    reviewedAt: $checkedConvert(
      'reviewedAt',
      (v) => v == null ? null : DateTime.parse(v as String),
    ),
  );
  return val;
});

Map<String, dynamic> _$ProductChangeRequestResponseDtoToJson(
  ProductChangeRequestResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'productId': instance.productId,
  'status':
      _$ProductChangeRequestResponseDtoStatusEnumEnumMap[instance.status]!,
  'content': instance.content.toJson(),
  'rejectionReason': instance.rejectionReason,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
  'reviewedAt': instance.reviewedAt?.toIso8601String(),
};

const _$ProductChangeRequestResponseDtoStatusEnumEnumMap = {
  ProductChangeRequestResponseDtoStatusEnum.pending: 'pending',
  ProductChangeRequestResponseDtoStatusEnum.approved: 'approved',
  ProductChangeRequestResponseDtoStatusEnum.rejected: 'rejected',
  ProductChangeRequestResponseDtoStatusEnum.superseded: 'superseded',
  ProductChangeRequestResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
