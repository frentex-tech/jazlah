// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_refund_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderRefundResponseDto _$OrderRefundResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderRefundResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'amountHalalas',
      'destination',
      'status',
      'reason',
      'createdAt',
    ],
  );
  final val = OrderRefundResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    amountHalalas: $checkedConvert('amountHalalas', (v) => (v as num).toInt()),
    destination: $checkedConvert(
      'destination',
      (v) => $enumDecode(
        _$OrderRefundResponseDtoDestinationEnumEnumMap,
        v,
        unknownValue:
            OrderRefundResponseDtoDestinationEnum.unknownDefaultOpenApi,
      ),
    ),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$OrderRefundResponseDtoStatusEnumEnumMap,
        v,
        unknownValue: OrderRefundResponseDtoStatusEnum.unknownDefaultOpenApi,
      ),
    ),
    reason: $checkedConvert('reason', (v) => v as String),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$OrderRefundResponseDtoToJson(
  OrderRefundResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'amountHalalas': instance.amountHalalas,
  'destination':
      _$OrderRefundResponseDtoDestinationEnumEnumMap[instance.destination]!,
  'status': _$OrderRefundResponseDtoStatusEnumEnumMap[instance.status]!,
  'reason': instance.reason,
  'createdAt': instance.createdAt.toIso8601String(),
};

const _$OrderRefundResponseDtoDestinationEnumEnumMap = {
  OrderRefundResponseDtoDestinationEnum.wallet: 'wallet',
  OrderRefundResponseDtoDestinationEnum.original: 'original',
  OrderRefundResponseDtoDestinationEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};

const _$OrderRefundResponseDtoStatusEnumEnumMap = {
  OrderRefundResponseDtoStatusEnum.pending: 'pending',
  OrderRefundResponseDtoStatusEnum.succeeded: 'succeeded',
  OrderRefundResponseDtoStatusEnum.failed: 'failed',
  OrderRefundResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
