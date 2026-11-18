// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_commission_change_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorCommissionChangePageResponseDto
_$VendorCommissionChangePageResponseDtoFromJson(Map<String, dynamic> json) =>
    $checkedCreate('VendorCommissionChangePageResponseDto', json, (
      $checkedConvert,
    ) {
      $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
      final val = VendorCommissionChangePageResponseDto(
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map(
                (e) => VendorCommissionChangeResponseDto.fromJson(
                  e as Map<String, dynamic>,
                ),
              )
              .toList(),
        ),
        nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$VendorCommissionChangePageResponseDtoToJson(
  VendorCommissionChangePageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
