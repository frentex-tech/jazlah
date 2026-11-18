// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_application_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorApplicationPageResponseDto _$VendorApplicationPageResponseDtoFromJson(
  Map<String, dynamic> json,
) =>
    $checkedCreate('VendorApplicationPageResponseDto', json, ($checkedConvert) {
      $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
      final val = VendorApplicationPageResponseDto(
        items: $checkedConvert(
          'items',
          (v) => (v as List<dynamic>)
              .map(
                (e) => VendorApplicationResponseDto.fromJson(
                  e as Map<String, dynamic>,
                ),
              )
              .toList(),
        ),
        nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
      );
      return val;
    });

Map<String, dynamic> _$VendorApplicationPageResponseDtoToJson(
  VendorApplicationPageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
