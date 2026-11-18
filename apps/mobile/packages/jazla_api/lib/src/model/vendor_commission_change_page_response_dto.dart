//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/vendor_commission_change_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'vendor_commission_change_page_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class VendorCommissionChangePageResponseDto {
  /// Returns a new [VendorCommissionChangePageResponseDto] instance.
  VendorCommissionChangePageResponseDto({

    required  this.items,

    required  this.nextCursor,
  });

      /// The commission changes of this page, newest first.
  @JsonKey(
    
    name: r'items',
    required: true,
    includeIfNull: false,
  )


  final List<VendorCommissionChangeResponseDto> items;



      /// Send as `cursor` to get the next page; null on the last page. Opaque: never build or change it.
  @JsonKey(
    
    name: r'nextCursor',
    required: true,
    includeIfNull: true,
  )


  final String? nextCursor;





    @override
    bool operator ==(Object other) => identical(this, other) || other is VendorCommissionChangePageResponseDto &&
      other.items == items &&
      other.nextCursor == nextCursor;

    @override
    int get hashCode =>
        items.hashCode +
        (nextCursor == null ? 0 : nextCursor.hashCode);

  factory VendorCommissionChangePageResponseDto.fromJson(Map<String, dynamic> json) => _$VendorCommissionChangePageResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$VendorCommissionChangePageResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

