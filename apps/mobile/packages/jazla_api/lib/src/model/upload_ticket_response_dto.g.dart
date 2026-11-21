// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'upload_ticket_response_dto.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UploadTicketResponseDto _$UploadTicketResponseDtoFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('UploadTicketResponseDto', json, ($checkedConvert) {
  $checkKeys(
    json,
    requiredKeys: const ['mediaId', 'url', 'fields', 'expiresAt', 'confirmBy'],
  );
  final val = UploadTicketResponseDto(
    mediaId: $checkedConvert('mediaId', (v) => v as String),
    url: $checkedConvert('url', (v) => v as String),
    fields: $checkedConvert(
      'fields',
      (v) => Map<String, String>.from(v as Map),
    ),
    expiresAt: $checkedConvert('expiresAt', (v) => DateTime.parse(v as String)),
    confirmBy: $checkedConvert('confirmBy', (v) => DateTime.parse(v as String)),
  );
  return val;
});

Map<String, dynamic> _$UploadTicketResponseDtoToJson(
  UploadTicketResponseDto instance,
) => <String, dynamic>{
  'mediaId': instance.mediaId,
  'url': instance.url,
  'fields': instance.fields,
  'expiresAt': instance.expiresAt.toIso8601String(),
  'confirmBy': instance.confirmBy.toIso8601String(),
};
