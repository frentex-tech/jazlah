// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_cart_item_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateCartItemDto _$UpdateCartItemDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('UpdateCartItemDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['quantity']);
      final val = UpdateCartItemDto(
        quantity: $checkedConvert('quantity', (v) => (v as num).toInt()),
      );
      return val;
    });

Map<String, dynamic> _$UpdateCartItemDtoToJson(UpdateCartItemDto instance) =>
    <String, dynamic>{'quantity': instance.quantity};
