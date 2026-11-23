//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/ordering_pause_response_dto.dart';
import 'package:jazla_api/src/model/time_window_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'client_settings_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class ClientSettingsResponseDto {
  /// Returns a new [ClientSettingsResponseDto] instance.
  ClientSettingsResponseDto({

    required  this.deliveryWindow,

    required  this.bookingHorizonDays,

    required  this.minOrderHalalas,

    required  this.deliveryFeeHalalas,

    required  this.codEnabled,

    required  this.codMaxOrderHalalas,

    required  this.paused,
  });

      /// The delivery window, Riyadh time.
  @JsonKey(
    
    name: r'deliveryWindow',
    required: true,
    includeIfNull: false,
  )


  final TimeWindowDto deliveryWindow;



      /// How many days ahead can be booked, counting today.
  @JsonKey(
    
    name: r'bookingHorizonDays',
    required: true,
    includeIfNull: false,
  )


  final int bookingHorizonDays;



      /// The smallest order (halalas, VAT included), compared with the subtotal before discounts.
  @JsonKey(
    
    name: r'minOrderHalalas',
    required: true,
    includeIfNull: false,
  )


  final int minOrderHalalas;



      /// The delivery fee of a delivery order (halalas, VAT included).
  @JsonKey(
    
    name: r'deliveryFeeHalalas',
    required: true,
    includeIfNull: false,
  )


  final int deliveryFeeHalalas;



      /// Whether cash on delivery is offered at all (each order also needs its type and total allowed).
  @JsonKey(
    
    name: r'codEnabled',
    required: true,
    includeIfNull: false,
  )


  final bool codEnabled;



      /// The largest order total cash on delivery is offered for; null: no limit.
  @JsonKey(
    
    name: r'codMaxOrderHalalas',
    required: true,
    includeIfNull: true,
  )


  final int? codMaxOrderHalalas;



      /// Whether new orders are paused, with the message to show.
  @JsonKey(
    
    name: r'paused',
    required: true,
    includeIfNull: false,
  )


  final OrderingPauseResponseDto paused;





    @override
    bool operator ==(Object other) => identical(this, other) || other is ClientSettingsResponseDto &&
      other.deliveryWindow == deliveryWindow &&
      other.bookingHorizonDays == bookingHorizonDays &&
      other.minOrderHalalas == minOrderHalalas &&
      other.deliveryFeeHalalas == deliveryFeeHalalas &&
      other.codEnabled == codEnabled &&
      other.codMaxOrderHalalas == codMaxOrderHalalas &&
      other.paused == paused;

    @override
    int get hashCode =>
        deliveryWindow.hashCode +
        bookingHorizonDays.hashCode +
        minOrderHalalas.hashCode +
        deliveryFeeHalalas.hashCode +
        codEnabled.hashCode +
        (codMaxOrderHalalas == null ? 0 : codMaxOrderHalalas.hashCode) +
        paused.hashCode;

  factory ClientSettingsResponseDto.fromJson(Map<String, dynamic> json) => _$ClientSettingsResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$ClientSettingsResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

