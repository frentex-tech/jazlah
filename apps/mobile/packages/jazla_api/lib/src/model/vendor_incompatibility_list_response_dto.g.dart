// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_incompatibility_list_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorIncompatibilityListResponseDto
_$VendorIncompatibilityListResponseDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('VendorIncompatibilityListResponseDto', json, (
      $checkedConvert,
    ) {
      $checkKeys(json, requiredKeys: const ['items']);
      final val = VendorIncompatibilityListResponseDto(
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map(
                (e) => VendorIncompatibilityResponseDto.fromJson(
                  e as Map<String, dynamic>,
                ),
              )
              .toList(),
        ),
      );
      return val;
    });

Map<String, dynamic> _$VendorIncompatibilityListResponseDtoToJson(
  VendorIncompatibilityListResponseDto instance,
) => <String, dynamic>{'items': instance.items.map((e) => e.toJson()).toList()};
