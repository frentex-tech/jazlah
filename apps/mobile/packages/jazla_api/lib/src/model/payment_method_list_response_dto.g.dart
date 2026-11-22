// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_method_list_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PaymentMethodListResponseDto _$PaymentMethodListResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PaymentMethodListResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['items', 'walletBalanceHalalas', 'totalHalalas'],
  );
  final val = PaymentMethodListResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) => PaymentMethodOptionResponseDto.fromJson(
              e as Map<String, dynamic>,
            ),
          )
          .toList(),
    ),
    walletBalanceHalalas: $checkedConvert(
      'walletBalanceHalalas',
      (v) => (v as num).toInt(),
    ),
    totalHalalas: $checkedConvert('totalHalalas', (v) => (v as num).toInt()),
  );
  return val;
});

Map<String, dynamic> _$PaymentMethodListResponseDtoToJson(
  PaymentMethodListResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'walletBalanceHalalas': instance.walletBalanceHalalas,
  'totalHalalas': instance.totalHalalas,
};
