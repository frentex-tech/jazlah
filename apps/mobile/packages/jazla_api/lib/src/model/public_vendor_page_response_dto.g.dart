// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_vendor_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PublicVendorPageResponseDto _$PublicVendorPageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('PublicVendorPageResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
  final val = PublicVendorPageResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) => PublicVendorResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$PublicVendorPageResponseDtoToJson(
  PublicVendorPageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
