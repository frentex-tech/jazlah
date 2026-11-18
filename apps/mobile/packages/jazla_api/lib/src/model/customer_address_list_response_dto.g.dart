// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_address_list_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CustomerAddressListResponseDto _$CustomerAddressListResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('CustomerAddressListResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items']);
  final val = CustomerAddressListResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                CustomerAddressResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
  );
  return val;
});

Map<String, dynamic> _$CustomerAddressListResponseDtoToJson(
  CustomerAddressListResponseDto instance,
) => <String, dynamic>{'items': instance.items.map((e) => e.toJson()).toList()};
