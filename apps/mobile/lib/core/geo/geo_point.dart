import 'package:flutter/foundation.dart';

/// A point in WGS84 degrees.
@immutable
class GeoPoint {
  const GeoPoint(this.latitude, this.longitude);

  final double latitude;
  final double longitude;

  /// Central Riyadh: where the map opens without a location.
  static const riyadh = GeoPoint(24.7136, 46.6753);

  @override
  bool operator ==(Object other) => other is GeoPoint && other.latitude == latitude && other.longitude == longitude;

  @override
  int get hashCode => Object.hash(latitude, longitude);
}
