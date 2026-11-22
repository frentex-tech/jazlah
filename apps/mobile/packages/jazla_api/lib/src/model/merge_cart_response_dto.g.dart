// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'merge_cart_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MergeCartResponseDto _$MergeCartResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('MergeCartResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['cart', 'replacedPreviousCart', 'skippedCount'],
  );
  final val = MergeCartResponseDto(
    cart: $checkedConvert(
      'cart',
      (v) => CartResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    replacedPreviousCart: $checkedConvert(
      'replacedPreviousCart',
      (v) => v as bool,
    ),
    skippedCount: $checkedConvert('skippedCount', (v) => (v as num).toInt()),
  );
  return val;
});

Map<String, dynamic> _$MergeCartResponseDtoToJson(
  MergeCartResponseDto instance,
) => <String, dynamic>{
  'cart': instance.cart.toJson(),
  'replacedPreviousCart': instance.replacedPreviousCart,
  'skippedCount': instance.skippedCount,
};
