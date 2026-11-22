//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/localized_text_response_dto.dart';
import 'package:jazla_api/src/model/order_item_size_response_dto.dart';
import 'package:jazla_api/src/model/order_option_response_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'cart_line_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CartLineResponseDto {
  /// Returns a new [CartLineResponseDto] instance.
  CartLineResponseDto({

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

    required  this.isAvailable,
  });

      /// The line (UUID).
  @JsonKey(
    
    name: r'id',
    required: true,
    includeIfNull: false,
  )


  final String id;



      /// The product (UUID).
  @JsonKey(
    
    name: r'productId',
    required: true,
    includeIfNull: false,
  )


  final String productId;



      /// The product’s name.
  @JsonKey(
    
    name: r'name',
    required: true,
    includeIfNull: false,
  )


  final LocalizedTextResponseDto name;



      /// The product’s first image; null for none.
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



      /// The chosen packaging; null for none.
  @JsonKey(
    
    name: r'packaging',
    required: true,
    includeIfNull: true,
  unknownEnumValue: CartLineResponseDtoPackagingEnum.unknownDefaultOpenApi,
  )


  final CartLineResponseDtoPackagingEnum? packaging;



      /// The \"without\" items; empty for none.
  @JsonKey(
    
    name: r'exclusions',
    required: true,
    includeIfNull: false,
  )


  final List<OrderOptionResponseDto> exclusions;



      /// The line’s note; null for none.
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



      /// The price of one as accepted (when added or last updated), in halalas, VAT included.
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



      /// Whether it can still be ordered as chosen; `false`: the ITEM_UNAVAILABLE issue.
  @JsonKey(
    
    name: r'isAvailable',
    required: true,
    includeIfNull: false,
  )


  final bool isAvailable;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CartLineResponseDto &&
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
      other.totalHalalas == totalHalalas &&
      other.isAvailable == isAvailable;

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
        totalHalalas.hashCode +
        isAvailable.hashCode;

  factory CartLineResponseDto.fromJson(Map<String, dynamic> json) => _$CartLineResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CartLineResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The chosen packaging; null for none.
enum CartLineResponseDtoPackagingEnum {
    /// The chosen packaging; null for none.
@JsonValue(r'trays')
trays(r'trays'),
    /// The chosen packaging; null for none.
@JsonValue(r'bags')
bags(r'bags'),
    /// The chosen packaging; null for none.
@JsonValue(r'vacuum')
vacuum(r'vacuum'),
    /// The chosen packaging; null for none.
@JsonValue(r'none')
none(r'none'),
    /// The chosen packaging; null for none.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CartLineResponseDtoPackagingEnum(this.value);

final String value;

@override
String toString() => value;
}


