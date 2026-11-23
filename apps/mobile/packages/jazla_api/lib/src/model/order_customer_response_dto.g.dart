// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_customer_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderCustomerResponseDto _$OrderCustomerResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('OrderCustomerResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['id', 'name', 'phone']);
  final val = OrderCustomerResponseDto(
    id: $checkedConvert('id', (v) => v as String),
    name: $checkedConvert('name', (v) => v as String?),
    phone: $checkedConvert('phone', (v) => v as String),
  );
  return val;
});

Map<String, dynamic> _$OrderCustomerResponseDtoToJson(
  OrderCustomerResponseDto instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'phone': instance.phone,
};
