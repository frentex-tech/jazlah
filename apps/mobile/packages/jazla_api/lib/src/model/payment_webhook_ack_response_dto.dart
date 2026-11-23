//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

part 'payment_webhook_ack_response_dto.g.dart';


@JsonSerializable(
  checked: true,
  createToJson: true,
  disallowUnrecognizedKeys: false,
  explicitToJson: true,
)
class PaymentWebhookAckResponseDto {
  /// Returns a new [PaymentWebhookAckResponseDto] instance.
  PaymentWebhookAckResponseDto({

    required  this.received,
  });

      /// Always true: the event was recorded (a repeat of an event already processed changes nothing).
  @JsonKey(
    
    name: r'received',
    required: true,
    includeIfNull: false,
  )


  final bool received;





    @override
    bool operator ==(Object other) => identical(this, other) || other is PaymentWebhookAckResponseDto &&
      other.received == received;

    @override
    int get hashCode =>
        received.hashCode;

  factory PaymentWebhookAckResponseDto.fromJson(Map<String, dynamic> json) => _$PaymentWebhookAckResponseDtoFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentWebhookAckResponseDtoToJson(this);

  @override
  String toString() {
    return toJson().toString();
  }

}

