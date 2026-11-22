//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/order_type.dart';
import 'package:json_annotation/json_annotation.dart';

part 'cod_settings_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CodSettingsDto {
  /// Returns a new [CodSettingsDto] instance.
  CodSettingsDto({

    required  this.enabled,

    required  this.maxOrderHalalas,

    required  this.allowedOrderTypes,

    required  this.confirmation,
  });

      /// Whether customers may choose cash on delivery.
  @JsonKey(
    
    name: r'enabled',
    required: true,
    includeIfNull: false,
  )


  final bool enabled;



      /// The largest order total (halalas, VAT included) cash on delivery is offered for; null: no limit.
          // minimum: 1
          // maximum: 10000000
  @JsonKey(
    
    name: r'maxOrderHalalas',
    required: true,
    includeIfNull: true,
  )


  final int? maxOrderHalalas;



      /// The kinds of order it is offered for; empty: none.
  @JsonKey(
    
    name: r'allowedOrderTypes',
    required: true,
    includeIfNull: false,
  )


  final List<OrderType> allowedOrderTypes;



      /// `auto`: the order is confirmed when placed; `review`: it waits as `new` for an admin to confirm or reject it (POST /v1/admin/orders/{id}/transition).
  @JsonKey(
    
    name: r'confirmation',
    required: true,
    includeIfNull: false,
  unknownEnumValue: CodSettingsDtoConfirmationEnum.unknownDefaultOpenApi,
  )


  final CodSettingsDtoConfirmationEnum confirmation;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CodSettingsDto &&
      other.enabled == enabled &&
      other.maxOrderHalalas == maxOrderHalalas &&
      other.allowedOrderTypes == allowedOrderTypes &&
      other.confirmation == confirmation;

    @override
    int get hashCode =>
        enabled.hashCode +
        (maxOrderHalalas == null ? 0 : maxOrderHalalas.hashCode) +
        allowedOrderTypes.hashCode +
        confirmation.hashCode;

  factory CodSettingsDto.fromJson(Map<String, dynamic> json) => _$CodSettingsDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CodSettingsDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// `auto`: the order is confirmed when placed; `review`: it waits as `new` for an admin to confirm or reject it (POST /v1/admin/orders/{id}/transition).
enum CodSettingsDtoConfirmationEnum {
    /// `auto`: the order is confirmed when placed; `review`: it waits as `new` for an admin to confirm or reject it (POST /v1/admin/orders/{id}/transition).
@JsonValue(r'auto')
auto(r'auto'),
    /// `auto`: the order is confirmed when placed; `review`: it waits as `new` for an admin to confirm or reject it (POST /v1/admin/orders/{id}/transition).
@JsonValue(r'review')
review(r'review'),
    /// `auto`: the order is confirmed when placed; `review`: it waits as `new` for an admin to confirm or reject it (POST /v1/admin/orders/{id}/transition).
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CodSettingsDtoConfirmationEnum(this.value);

final String value;

@override
String toString() => value;
}


