//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'upload_ticket_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class UploadTicketResponseDto {
  /// Returns a new [UploadTicketResponseDto] instance.
  UploadTicketResponseDto({

    required  this.mediaId,

    required  this.url,

    required  this.fields,

    required  this.expiresAt,

    required  this.confirmBy,
  });

      /// The id of the file (UUID). Confirm it with `POST .../media/{mediaId}/confirm` once uploaded; once confirmed, it is the id to give the endpoint that uses the file.
  @JsonKey(
    
    name: r'mediaId',
    required: true,
    includeIfNull: false,
  )


  final String mediaId;



      /// Where to upload the file: send `POST` to this URL as `multipart/form-data`, with `fields` and then the file. It is the storage, not this API: send no Authorization header.
  @JsonKey(
    
    name: r'url',
    required: true,
    includeIfNull: false,
  )


  final String url;



      /// The form fields of the upload, each sent as one text part with its name and value exactly as given, all before the file; then the file as the last part, named `file`. The names depend on the storage (the object key, the declared Content-Type, the signed policy and its signature): send every entry, add none and change none, or the storage refuses the upload.
  @JsonKey(
    
    name: r'fields',
    required: true,
    includeIfNull: false,
  )


  final Map<String, String> fields;



      /// Until when the storage accepts the upload (UTC, ISO 8601): 5 minutes after the request by default, a server setting. Until then the ticket may be used again; the last upload replaces the earlier one. After it, request a new ticket.
  @JsonKey(
    
    name: r'expiresAt',
    required: true,
    includeIfNull: false,
  )


  final DateTime expiresAt;



      /// The last moment the upload may be confirmed (UTC, ISO 8601): 1 hour after the request by default, a server setting, always after `expiresAt`. Past it, confirmation answers MEDIA_UPLOAD_EXPIRED and the upload is removed.
  @JsonKey(
    
    name: r'confirmBy',
    required: true,
    includeIfNull: false,
  )


  final DateTime confirmBy;





    @override
    bool operator ==(Object other) => identical(this, other) || other is UploadTicketResponseDto &&
      other.mediaId == mediaId &&
      other.url == url &&
      other.fields == fields &&
      other.expiresAt == expiresAt &&
      other.confirmBy == confirmBy;

    @override
    int get hashCode =>
        mediaId.hashCode +
        url.hashCode +
        fields.hashCode +
        expiresAt.hashCode +
        confirmBy.hashCode;

  factory UploadTicketResponseDto.fromJson(Map<String, dynamic> json) => _$UploadTicketResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$UploadTicketResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

