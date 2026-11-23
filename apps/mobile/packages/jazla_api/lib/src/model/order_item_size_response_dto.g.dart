// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_item_size_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderItemSizeResponseDto _$OrderItemSizeResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderItemSizeResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['id', 'approxWeightGrams', 'tag']);
  final val = OrderItemSizeResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    approxWeightGrams: $checkedConvert(
      'approxWeightGrams',
      (v) => (v as num).toInt(),
    ),
    tag: $checkedConvert(
      'tag',
      (v) => v == null
          ? null
          : LocalizedTextResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$OrderItemSizeResponseDtoToJson(
  OrderItemSizeResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'approxWeightGrams': instance.approxWeightGrams,
  'tag': instance.tag?.toJson(),
};
