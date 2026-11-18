//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/admin_vendor_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'admin_vendor_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class AdminVendorPageResponseDto {
  /// Returns a new [AdminVendorPageResponseDto] instance.
  AdminVendorPageResponseDto({

    required  this.items,

    required  this.nextCursor,
  });

      /// The vendors of this page, newest first.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<AdminVendorResponseDto> items;



      /// Send as `cursor` to get the next page; null on the last page. Opaque: never build or change it.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is AdminVendorPageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory AdminVendorPageResponseDto.fromJson(Map<String, dynamic> json) => _$AdminVendorPageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$AdminVendorPageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

