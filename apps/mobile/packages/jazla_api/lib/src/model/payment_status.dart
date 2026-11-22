//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

/// The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).
enum PaymentStatus {
          /// The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).
      @JsonValue(r'initiated')
      initiated(r'initiated'),
          /// The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).
      @JsonValue(r'authorized')
      authorized(r'authorized'),
          /// The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).
      @JsonValue(r'captured')
      captured(r'captured'),
          /// The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).
      @JsonValue(r'failed')
      failed(r'failed'),
          /// The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).
      @JsonValue(r'cancelled')
      cancelled(r'cancelled'),
          /// The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).
      @JsonValue(r'refunded')
      refunded(r'refunded'),
          /// The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).
      @JsonValue(r'partially_refunded')
      partiallyRefunded(r'partially_refunded'),
          /// The latest payment’s status; null when nothing is charged online (cash on delivery, wallet only).
      @JsonValue(r'unknown_default_open_api')
      unknownDefaultOpenApi(r'unknown_default_open_api');

  const PaymentStatus(this.value);

  final String value;

  @override
  String toString() => value;
}
