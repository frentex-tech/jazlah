// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'merge_cart_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MergeCartDto _$MergeCartDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('MergeCartDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['mergeId', 'items']);
      final val = MergeCartDto(
        mergeId: $checkedConvert('mergeId', (v) => v as String),
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map((e) => CartItemInputDto.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
      );
      return val;
    });

Map<String, dynamic> _$MergeCartDtoToJson(MergeCartDto instance) =>
    <String, dynamic>{
      'mergeId': instance.mergeId,
      'items': instance.items.map((e) => e.toJson()).toList(),
    };
