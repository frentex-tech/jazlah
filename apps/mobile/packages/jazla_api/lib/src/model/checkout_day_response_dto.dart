//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/time_window_dto.dart';
import 'package:json_annotation/json_annotation.dart';

part 'checkout_day_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class CheckoutDayResponseDto {
  /// Returns a new [CheckoutDayResponseDto] instance.
  CheckoutDayResponseDto({

    required  this.date,

    required  this.isAvailable,

    required  this.reason,

    required  this.window,
  });

      /// The day, Riyadh calendar `yyyy-MM-dd`.
  @JsonKey(
    
    name: r'date',
    required: true,
    includeIfNull: false,
  )


  final String date;



      /// Whether it can be chosen; `false`: shown disabled with `reason`.
  @JsonKey(
    
    name: r'isAvailable',
    required: true,
    includeIfNull: false,
  )


  final bool isAvailable;



      /// Why not, when `isAvailable` is false; null otherwise.
  @JsonKey(
    
    name: r'reason',
    required: true,
    includeIfNull: true,
  unknownEnumValue: CheckoutDayResponseDtoReasonEnum.unknownDefaultOpenApi,
  )


  final CheckoutDayResponseDtoReasonEnum? reason;



      /// The delivery window (delivery) or the store’s hours that day (pickup); null when unavailable.
  @JsonKey(
    
    name: r'window',
    required: true,
    includeIfNull: true,
  )


  final TimeWindowDto? window;





    @override
    bool operator ==(Object other) => identical(this, other) || other is CheckoutDayResponseDto &&
      other.date == date &&
      other.isAvailable == isAvailable &&
      other.reason == reason &&
      other.window == window;

    @override
    int get hashCode =>
        date.hashCode +
        isAvailable.hashCode +
        (reason == null ? 0 : reason.hashCode) +
        (window == null ? 0 : window.hashCode);

  factory CheckoutDayResponseDto.fromJson(Map<String, dynamic> json) => _$CheckoutDayResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$CheckoutDayResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

/// Why not, when `isAvailable` is false; null otherwise.
enum CheckoutDayResponseDtoReasonEnum {
    /// Why not, when `isAvailable` is false; null otherwise.
@JsonValue(r'PAST_CUTOFF')
PAST_CUTOFF(r'PAST_CUTOFF'),
    /// Why not, when `isAvailable` is false; null otherwise.
@JsonValue(r'CLOSED')
CLOSED(r'CLOSED'),
    /// Why not, when `isAvailable` is false; null otherwise.
@JsonValue(r'FULL')
FULL(r'FULL'),
    /// Why not, when `isAvailable` is false; null otherwise.
@JsonValue(r'OUTSIDE_HORIZON')
OUTSIDE_HORIZON(r'OUTSIDE_HORIZON'),
    /// Why not, when `isAvailable` is false; null otherwise.
@JsonValue(r'VENDOR_CLOSED')
VENDOR_CLOSED(r'VENDOR_CLOSED'),
    /// Why not, when `isAvailable` is false; null otherwise.
@JsonValue(r'unknown_default_open_api')
unknownDefaultOpenApi(r'unknown_default_open_api');

const CheckoutDayResponseDtoReasonEnum(this.value);

final String value;

@override
String toString() => value;
}


