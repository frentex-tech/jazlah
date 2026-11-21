//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/public_vendor_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'public_vendor_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PublicVendorPageResponseDto {
  /// Returns a new [PublicVendorPageResponseDto] instance.
  PublicVendorPageResponseDto({

    required  this.items,

    required  this.nextCursor,
  });

      /// The active vendors of this page, newest first.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<PublicVendorResponseDto> items;



      /// Send as `cursor` to get the next page; null on the last page. Opaque: never build or change it.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PublicVendorPageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory PublicVendorPageResponseDto.fromJson(Map<String, dynamic> json) => _$PublicVendorPageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PublicVendorPageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

