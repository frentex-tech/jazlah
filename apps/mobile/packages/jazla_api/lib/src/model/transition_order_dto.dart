//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:jazla_api/src/model/order_status.dart';
import 'package:json_annotation/json_annotation.dart';

part 'transition_order_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class TransitionOrderDto {
  /// Returns a new [TransitionOrderDto] instance.
  TransitionOrderDto({

    required  this.to,

     this.note,
  });

      /// The status to move to; one of the order’s `allowedTransitions` (ORDER_TRANSITION_NOT_ALLOWED otherwise).
  @JsonKey(
    
    name: r'to',
    required: true,
    includeIfNull: false,
  unknownEnumValue: OrderStatus.unknownDefaultOpenApi,
  )


  final OrderStatus to;



      /// A note kept in the history, up to 500 characters; required when cancelling (rejecting a cash-on-delivery order: the reason the customer sees).
  @JsonKey(
    
    name: r'note',
    required: false,
    includeIfNull: false,
  )


  final String? note;





    @override
    bool operator ==(Object other) => identical(this, other) || other is TransitionOrderDto &&
      other.to == to &&
      other.note == note;

    @override
    int get hashCode =>
        to.hashCode +
        note.hashCode;

  factory TransitionOrderDto.fromJson(Map<String, dynamic> json) => _$TransitionOrderDtoFromJson(json);

  Map<String, dynamic> toJson() => _$TransitionOrderDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

