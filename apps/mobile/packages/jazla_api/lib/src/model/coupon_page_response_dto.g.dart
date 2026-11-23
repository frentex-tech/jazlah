// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'coupon_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CouponPageResponseDto _$CouponPageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CouponPageResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
  final val = CouponPageResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map((e) => CouponResponseDto.fromJson(e as Map<String, dynamic>))
          .toList(),
    ),
    nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$CouponPageResponseDtoToJson(
  CouponPageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
