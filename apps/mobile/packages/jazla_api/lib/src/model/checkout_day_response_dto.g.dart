// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'checkout_day_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CheckoutDayResponseDto _$CheckoutDayResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CheckoutDayResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['date', 'isAvailable', 'reason', 'window'],
  );
  final val = CheckoutDayResponseDto(
    date: $checkedConvert('date', (v) => v as String),
    isAvailable: $checkedConvert('isAvailable', (v) => v as bool),
    reason: $checkedConvert(
      'reason',
      (v) => $enumDecodeNullable(
        _$CheckoutDayResponseDtoReasonEnumEnumMap,
        v,
        unknownValue: CheckoutDayResponseDtoReasonEnum.unknownDefaultOpenApi,
      ),
    ),
    window: $checkedConvert(
      'window',
      (v) =>
          v == null ? null : TimeWindowDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$CheckoutDayResponseDtoToJson(
  CheckoutDayResponseDto instance,
) => <String, dynamic>{
  'date': instance.date,
  'isAvailable': instance.isAvailable,
  'reason': _$CheckoutDayResponseDtoReasonEnumEnumMap[instance.reason],
  'window': instance.window?.toJson(),
};

const _$CheckoutDayResponseDtoReasonEnumEnumMap = {
  CheckoutDayResponseDtoReasonEnum.PAST_CUTOFF: 'PAST_CUTOFF',
  CheckoutDayResponseDtoReasonEnum.CLOSED: 'CLOSED',
  CheckoutDayResponseDtoReasonEnum.FULL: 'FULL',
  CheckoutDayResponseDtoReasonEnum.OUTSIDE_HORIZON: 'OUTSIDE_HORIZON',
  CheckoutDayResponseDtoReasonEnum.VENDOR_CLOSED: 'VENDOR_CLOSED',
  CheckoutDayResponseDtoReasonEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
