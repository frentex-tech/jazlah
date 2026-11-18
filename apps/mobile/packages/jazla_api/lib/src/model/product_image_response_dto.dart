//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'product_image_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ProductImageResponseDto {
  /// Returns a new [ProductImageResponseDto] instance.
  ProductImageResponseDto({

    required  this.mediaId,

    required  this.url,
  });

      /// The media id (UUID) of the image: send it back in `imageMediaIds` to keep the image in a content edit.
  @JsonKey(
    
    name: r'mediaId',
    required: true,
    includeIfNull: false,
  )


  final String mediaId;



      /// The public URL of the image; null only while the file cannot be served (not confirmed or removed).
  @JsonKey(
    
    name: r'url',
    required: true,
    includeIfNull: true,
  )


  final String? url;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ProductImageResponseDto &&
      other.mediaId == mediaId &&
      other.url == url;

    @override
    int get hashCode =>
        mediaId.hashCode +
        (url == null ? 0 : url.hashCode);

  factory ProductImageResponseDto.fromJson(Map<String, dynamic> json) => _$ProductImageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ProductImageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

