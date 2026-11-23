// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'checkout_day_list_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CheckoutDayListResponseDto _$CheckoutDayListResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CheckoutDayListResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items']);
  final val = CheckoutDayListResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) => CheckoutDayResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$CheckoutDayListResponseDtoToJson(
  CheckoutDayListResponseDto instance,
) => <String, dynamic>{'items': instance.items.map((e) => e.toJson()).toList()};
