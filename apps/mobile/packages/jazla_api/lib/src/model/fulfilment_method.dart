//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:json_annotation/json_annotation.dart';

/// Delivered or picked up.
enum FulfilmentMethod {
          /// Delivered or picked up.
      @JsonValue(r'delivery')
      delivery(r'delivery'),
          /// Delivered or picked up.
      @JsonValue(r'pickup')
      pickup(r'pickup'),
          /// Delivered or picked up.
      @JsonValue(r'unknown_default_open_api')
      unknownDefaultOpenApi(r'unknown_default_open_api');

  const FulfilmentMethod(this.value);

  final String value;

  @override
  String toString() => value;
}
