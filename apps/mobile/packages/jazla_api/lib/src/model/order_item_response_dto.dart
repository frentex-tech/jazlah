//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/order_item_size_response_dto.dart';
import 'package:jazla_api/src/model/order_option_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'order_item_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class OrderItemResponseDto {
  /// Returns a new [OrderItemResponseDto] instance.
  OrderItemResponseDto({

    required  this.id,

    required  this.productId,

    required  this.name,

    required  this.imageUrl,

    required  this.size,

    required  this.cutting,

    required  this.packaging,

    required  this.exclusions,

    required  this.notes,

    required  this.quantity,

    required  this.unitPriceHalalas,

    required  this.totalHalalas,
  });

      /// The line’s id (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The product (UUID); it may have changed or gone since.
  @JsonKey(
    
    name: r'productId',
    required: true,
    includeIfNull: false,
  )


  final String productId;



      /// The product’s name when ordered.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// The product’s first image when ordered; null for none.
  @JsonKey(
    
    name: r'imageUrl',
    required: true,
    includeIfNull: true,
  )


  final String? imageUrl;



      /// The chosen size.
  @JsonKey(
    
    name: r'size',
    required: true,
    includeIfNull: false,
  )


  final OrderItemSizeResponseDto size;



      /// The chosen cutting style; null for none.
  @JsonKey(
    
    name: r'cutting',
    required: true,
    includeIfNull: true,
  )


  final OrderOptionResponseDto? cutting;



      /// The chosen packaging; null for none. Names are the apps’.
  @JsonKey(
    
    name: r'packaging',
    required: true,
    includeIfNull: true,
  unknownEnumValue: OrderItemResponseDtoPackagingEnum.unknownDefaultOpenApi,
  )


  final OrderItemResponseDtoPackagingEnum? packaging;



      /// The \"without\" items chosen; empty for none.
  @JsonKey(
    
    name: r'exclusions',
    required: true,
    includeIfNull: false,
  )


  final List<OrderOptionResponseDto> exclusions;



      /// The customer’s note on the line; null for none.
  @JsonKey(
    
    name: r'notes',
    required: true,
    includeIfNull: true,
  )


  final String? notes;



      /// How many.
  @JsonKey(
    
    name: r'quantity',
    required: true,
    includeIfNull: false,
  )


  final int quantity;



      /// The price of one, size plus options, in halalas (VAT included), as charged.
  @JsonKey(
    
    name: r'unitPriceHalalas',
    required: true,
    includeIfNull: false,
  )


  final int unitPriceHalalas;



      /// unitPriceHalalas × quantity.
  @JsonKey(
    
    name: r'totalHalalas',
    required: true,
    includeIfNull: false,
  )


  final int totalHalalas;





    @override
    bool operator ==(Object other) => identical(this, other) || other is OrderItemResponseDto &&
      other.id == id &&
      other.productId == productId &&
      other.name == name &&
      other.imageUrl == imageUrl &&
      other.size == size &&
      other.cutting == cutting &&
      other.packaging == packaging &&
      other.exclusions == exclusions &&
      other.notes == notes &&
      other.quantity == quantity &&
      other.unitPriceHalalas == unitPriceHalalas &&
      other.totalHalalas == totalHalalas;

    @override
    int get hashCode =>
        id.hashCode +
        productId.hashCode +
        name.hashCode +
        (imageUrl == null ? 0 : imageUrl.hashCode) +
        size.hashCode +
        (cutting == null ? 0 : cutting.hashCode) +
        (packaging == null ? 0 : packaging.hashCode) +
        exclusions.hashCode +
        (notes == null ? 0 : notes.hashCode) +
        quantity.hashCode +
        unitPriceHalalas.hashCode +
        totalHalalas.hashCode;

  factory OrderItemResponseDto.fromJson(Map<String, dynamic> json) => _$OrderItemResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$OrderItemResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The chosen packaging; null for none. Names are the apps’.
enum OrderItemResponseDtoPackagingEnum {
    /// The chosen packaging; null for none. Names are the apps’.
@JsonValue(r'trays')
trays(r'trays'),
    /// The chosen packaging; null for none. Names are the apps’.
@JsonValue(r'bags')
bags(r'bags'),
    /// The chosen packaging; null for none. Names are the apps’.
@JsonValue(r'vacuum')
vacuum(r'vacuum'),
    /// The chosen packaging; null for none. Names are the apps’.
@JsonValue(r'none')
none(r'none'),
    /// The chosen packaging; null for none. Names are the apps’.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const OrderItemResponseDtoPackagingEnum(this.value);

final String value;

@override
String toString() => value;
}


