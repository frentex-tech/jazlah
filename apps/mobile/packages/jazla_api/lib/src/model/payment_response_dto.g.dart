// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PaymentResponseDto _$PaymentResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PaymentResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'id',
      'method',
      'status',
      'amountHalalas',
      'nextAction',
      'createdAt',
    ],
  );
  final val = PaymentResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    method: $checkedConvert(
      'method',
      (v) => $enumDecode(
        _$PaymentResponseDtoMethodEnumEnumMap,
        v,
        unknownValue: PaymentResponseDtoMethodEnum.unknownDefaultOpenApi,
      ),
    ),
    status: $checkedConvert(
      'status',
      (v) => $enumDecode(
        _$PaymentResponseDtoStatusEnumEnumMap,
        v,
        unknownValue: PaymentResponseDtoStatusEnum.unknownDefaultOpenApi,
      ),
    ),
    amountHalalas: $checkedConvert('amountHalalas', (v) => (v as num).toInt()),
    nextAction: $checkedConvert(
      'nextAction',
      (v) => v == null
          ? null
          : PaymentNextActionResponseDto.fromJson(v as Map<String, dynamic>),
    ),
    createdAt: $checkedConvert('createdAt', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$PaymentResponseDtoToJson(PaymentResponseDto instance) =>
    <String, dynamic>{
      'id': instance.id,
      'method': _$PaymentResponseDtoMethodEnumEnumMap[instance.method]!,
      'status': _$PaymentResponseDtoStatusEnumEnumMap[instance.status]!,
      'amountHalalas': instance.amountHalalas,
      'nextAction': instance.nextAction?.toJson(),
      'createdAt': instance.createdAt.toIso8601String(),
    };

const _$PaymentResponseDtoMethodEnumEnumMap = {
  PaymentResponseDtoMethodEnum.mada: 'mada',
  PaymentResponseDtoMethodEnum.card: 'card',
  PaymentResponseDtoMethodEnum.applepay: 'applepay',
  PaymentResponseDtoMethodEnum.cod: 'cod',
  PaymentResponseDtoMethodEnum.wallet: 'wallet',
  PaymentResponseDtoMethodEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};

const _$PaymentResponseDtoStatusEnumEnumMap = {
  PaymentResponseDtoStatusEnum.initiated: 'initiated',
  PaymentResponseDtoStatusEnum.authorized: 'authorized',
  PaymentResponseDtoStatusEnum.captured: 'captured',
  PaymentResponseDtoStatusEnum.failed: 'failed',
  PaymentResponseDtoStatusEnum.cancelled: 'cancelled',
  PaymentResponseDtoStatusEnum.refunded: 'refunded',
  PaymentResponseDtoStatusEnum.partiallyRefunded: 'partially_refunded',
  PaymentResponseDtoStatusEnum.unknownDefaultOpenApi:
      'unknown_default_open_api',
};
