//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'cart_item_input_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CartItemInputDto {
  /// Returns a new [CartItemInputDto] instance.
  CartItemInputDto({

    required  this.productId,

    required  this.sizeId,

     this.cuttingStyleId,

     this.packaging,

     this.exclusionItemIds,

     this.notes,

    required  this.quantity,
  });

      /// The product (UUID), from the public catalog.
  @JsonKey(
    
    name: r'productId',
    required: true,
    includeIfNull: false,
  )


  final String productId;



      /// The chosen size (`sizes[].id` of the public product).
  @JsonKey(
    
    name: r'sizeId',
    required: true,
    includeIfNull: false,
  )


  final String sizeId;



      /// The chosen cutting style (`cuttings[].cuttingStyleId`); null or left out: none (OPTION_REQUIRED when the product offers cuttings).
  @JsonKey(
    
    name: r'cuttingStyleId',
    required: false,
    includeIfNull: false,
  )


  final String? cuttingStyleId;



      /// The chosen packaging (`packagings[].packaging`; `none` is the product’s own \"no packaging\" option); null or left out: the product offers no packaging.
  @JsonKey(
    
    name: r'packaging',
    required: false,
    includeIfNull: false,
  unknownEnumValue: CartItemInputDtoPackagingEnum.unknownDefaultOpenApi,
  )


  final CartItemInputDtoPackagingEnum? packaging;



      /// The \"without\" items chosen (`exclusions[].id`), each once, at most 20; left out: none.
  @JsonKey(
    
    name: r'exclusionItemIds',
    required: false,
    includeIfNull: false,
  )


  final List<String>? exclusionItemIds;



      /// A note on the line, up to 200 characters; lines differing only by note stay separate.
  @JsonKey(
    
    name: r'notes',
    required: false,
    includeIfNull: false,
  )


  final String? notes;



      /// How many, 1 to 99.
          // minimum: 1
          // maximum: 99
  @JsonKey(
    
    name: r'quantity',
    required: true,
    includeIfNull: false,
  )


  final int quantity;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CartItemInputDto &&
      other.productId == productId &&
      other.sizeId == sizeId &&
      other.cuttingStyleId == cuttingStyleId &&
      other.packaging == packaging &&
      other.exclusionItemIds == exclusionItemIds &&
      other.notes == notes &&
      other.quantity == quantity;

    @override
    int get hashCode =>
        productId.hashCode +
        sizeId.hashCode +
        (cuttingStyleId == null ? 0 : cuttingStyleId.hashCode) +
        (packaging == null ? 0 : packaging.hashCode) +
        exclusionItemIds.hashCode +
        notes.hashCode +
        quantity.hashCode;

  factory CartItemInputDto.fromJson(Map<String, dynamic> json) => _$CartItemInputDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CartItemInputDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// The chosen packaging (`packagings[].packaging`; `none` is the product’s own \"no packaging\" option); null or left out: the product offers no packaging.
enum CartItemInputDtoPackagingEnum {
    /// The chosen packaging (`packagings[].packaging`; `none` is the product’s own \"no packaging\" option); null or left out: the product offers no packaging.
@JsonValue(r'trays')
trays(r'trays'),
    /// The chosen packaging (`packagings[].packaging`; `none` is the product’s own \"no packaging\" option); null or left out: the product offers no packaging.
@JsonValue(r'bags')
bags(r'bags'),
    /// The chosen packaging (`packagings[].packaging`; `none` is the product’s own \"no packaging\" option); null or left out: the product offers no packaging.
@JsonValue(r'vacuum')
vacuum(r'vacuum'),
    /// The chosen packaging (`packagings[].packaging`; `none` is the product’s own \"no packaging\" option); null or left out: the product offers no packaging.
@JsonValue(r'none')
none(r'none'),
    /// The chosen packaging (`packagings[].packaging`; `none` is the product’s own \"no packaging\" option); null or left out: the product offers no packaging.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CartItemInputDtoPackagingEnum(this.value);

final String value;

@override
String toString() => value;
}


