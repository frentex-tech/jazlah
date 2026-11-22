// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_fulfilment_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CartFulfilmentResponseDto _$CartFulfilmentResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CartFulfilmentResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const [
      'method',
      'addressId',
      'date',
      'window',
      'pickupPoint',
    ],
  );
  final val = CartFulfilmentResponseDto(
    method: $checkedConvert(
      'method',
      (v) => $enumDecode(
        _$FulfilmentMethodEnumMap,
        v,
        unknownValue: FulfilmentMethod.unknownDefaultOpenApi,
      ),
    ),
    addressId: $checkedConvert('addressId', (v) => v as String?),
    date: $checkedConvert('date', (v) => v as String),
    window: $checkedConvert(
      'window',
      (v) =>
          v == null ? null : TimeWindowDto.fromJson(v as Map<String, dynamic>),
    ),
    pickupPoint: $checkedConvert(
      'pickupPoint',
      (v) => v == null
          ? null
          : PickupPointResponseDto.fromJson(v as Map<String, dynamic>),
    ),
  );
  return val;
});

Map<String, dynamic> _$CartFulfilmentResponseDtoToJson(
  CartFulfilmentResponseDto instance,
) => <String, dynamic>{
  'method': _$FulfilmentMethodEnumMap[instance.method]!,
  'addressId': instance.addressId,
  'date': instance.date,
  'window': instance.window?.toJson(),
  'pickupPoint': instance.pickupPoint?.toJson(),
};

const _$FulfilmentMethodEnumMap = {
  FulfilmentMethod.delivery: 'delivery',
  FulfilmentMethod.pickup: 'pickup',
  FulfilmentMethod.unknownDefaultOpenApi: 'unknown_default_open_api',
};
