// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'review_queue_item_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ReviewQueueItemResponseDto _$ReviewQueueItemResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ReviewQueueItemResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'kind',
      'productId',
      'changeRequestId',
      'vendor',
      'name',
      'submittedAt',
    ],
  );
  final val = ReviewQueueItemResponseDto(
    kind: $checkedConvert(
      'kind',
      (v) => $enumDecode(
        _$ReviewQueueItemResponseDtoKindEnumEnumMap,
        v,
        unknownValue: ReviewQueueItemResponseDtoKindEnum.unknownDefaultOpenApi,
      ),
    ),
    productId: $checkedConvert('productId', (v) => v as String),
    changeRequestId: $checkedConvert('changeRequestId', (v) => v as String?),
    vendor: $checkedConvert(
      'vendor',
      (v) => ProductVendorResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    name: $checkedConvert(
      'name',
      (v) => LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    submittedAt: $checkedConvert(
      'submittedAt',
      (v) => DateTime.parse(v as String),
    ),
  );
  return val;
});

Map<String, dynamic> _$ReviewQueueItemResponseDtoToJson(
  ReviewQueueItemResponseDto instance,
) => <String, dynamic>{
  'kind': _$ReviewQueueItemResponseDtoKindEnumEnumMap[instance.kind]!,
  'productId': instance.productId,
  'changeRequestId': instance.changeRequestId,
  'vendor': instance.vendor.toJson(),
  'name': instance.name.toJson(),
  'submittedAt': instance.submittedAt.toIso8601String(),
};

const _$ReviewQueueItemResponseDtoKindEnumEnumMap = {
  ReviewQueueItemResponseDtoKindEnum.product: 'product',
  ReviewQueueItemResponseDtoKindEnum.changeRequest: 'change_request',
  ReviewQueueItemResponseDtoKindEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
