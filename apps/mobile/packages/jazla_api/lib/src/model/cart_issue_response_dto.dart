//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'cart_issue_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CartIssueResponseDto {
  /// Returns a new [CartIssueResponseDto] instance.
  CartIssueResponseDto({

    required  this.code,

    required  this.lineId,

    required  this.oldUnitPriceHalalas,

    required  this.newUnitPriceHalalas,
  });

      /// `PRICE_CHANGED` or `ITEM_UNAVAILABLE`.
  @JsonKey(
    
    name: r'code',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CartIssueResponseDtoCodeEnum.unknownDefaultOpenApi,
  )


  final CartIssueResponseDtoCodeEnum code;



      /// The line (UUID).
  @JsonKey(
    
    name: r'lineId',
    required: true,
    includeIfNull: false,
  )


  final String lineId;



      /// PRICE_CHANGED: the accepted price; null otherwise.
  @JsonKey(
    
    name: r'oldUnitPriceHalalas',
    required: true,
    includeIfNull: true,
  )


  final int? oldUnitPriceHalalas;



      /// PRICE_CHANGED: today’s price; null otherwise.
  @JsonKey(
    
    name: r'newUnitPriceHalalas',
    required: true,
    includeIfNull: true,
  )


  final int? newUnitPriceHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CartIssueResponseDto &&
      other.code == code &&
      other.lineId == lineId &&
      other.oldUnitPriceHalalas == oldUnitPriceHalalas &&
      other.newUnitPriceHalalas == newUnitPriceHalalas;

    @override
    int get hashCode =>
        code.hashCode +
        lineId.hashCode +
        (oldUnitPriceHalalas == null ? 0 : oldUnitPriceHalalas.hashCode) +
        (newUnitPriceHalalas == null ? 0 : newUnitPriceHalalas.hashCode);

  factory CartIssueResponseDto.fromJson(Map<String, dynamic> json) => _$CartIssueResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CartIssueResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// `PRICE_CHANGED` or `ITEM_UNAVAILABLE`.
enum CartIssueResponseDtoCodeEnum {
    /// `PRICE_CHANGED` or `ITEM_UNAVAILABLE`.
@JsonValue(r'PRICE_CHANGED')
PRICE_CHANGED(r'PRICE_CHANGED'),
    /// `PRICE_CHANGED` or `ITEM_UNAVAILABLE`.
@JsonValue(r'ITEM_UNAVAILABLE')
ITEM_UNAVAILABLE(r'ITEM_UNAVAILABLE'),
    /// `PRICE_CHANGED` or `ITEM_UNAVAILABLE`.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CartIssueResponseDtoCodeEnum(this.value);

final String value;

@override
String toString() => value;
}


