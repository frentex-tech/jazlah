// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_vendor_page_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminVendorPageResponseDto _$AdminVendorPageResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('AdminVendorPageResponseDto', json, ($checkedConvert) {
  $checkKeys(json, requiredKeys: const ['items', 'nextCursor']);
  final val = AdminVendorPageResponseDto(
    items: $checkedConvert(
      'items',
      (v) => (v as List<dynamic>)
          .map(
            (e) => AdminVendorResponseDto.fromJson(e as Map<String, dynamic>),
          )
          .toList(),
    ),
    nextCursor: $checkedConvert('nextCursor', (v) => v as String?),
  );
  return val;
});

Map<String, dynamic> _$AdminVendorPageResponseDtoToJson(
  AdminVendorPageResponseDto instance,
) => <String, dynamic>{
  'items': instance.items.map((e) => e.toJson()).toList(),
  'nextCursor': instance.nextCursor,
};
