// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_image_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ProductImageResponseDto _$ProductImageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('ProductImageResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['mediaId', 'url']);
  final val = ProductImageResponseDto(
    mediaId: $checkedConvert('mediaId', (v) => v as String),
    url: $checkedConvert('url', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$ProductImageResponseDtoToJson(
  ProductImageResponseDto instance,
) => <String, dynamic>{'mediaId': instance.mediaId, 'url': instance.url};
