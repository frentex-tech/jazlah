// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderPageResponseDto _$OrderPageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderPageResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
  final val = OrderPageResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) => OrderSummaryResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$OrderPageResponseDtoToJson(
  OrderPageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
