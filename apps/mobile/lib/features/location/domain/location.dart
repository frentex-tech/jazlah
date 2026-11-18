import 'package:jazlah/core/geo/geo_point.dart';

export 'package:jazlah/core/geo/geo_point.dart';

/// Readable parts of a point (reverse geocoding), as the address form needs them.
class PlaceAddress {
  const PlaceAddress({this.city, this.district, this.street});

  final String? city;
  final String? district;
  final String? street;

  /// «حي الملقا، شارع أنس بن مالك»: district and street, else whatever is known.
  /// [separator] is the language's list separator (`listSeparator` in the ARB files).
  String line(String separator) => [district, street].whereType<String>().where((s) => s.isNotEmpty).join(separator);
}

class PlaceSuggestion {
  const PlaceSuggestion({required this.label, required this.point});

  final String label;
  final GeoPoint point;
}

/// Is a point inside a delivery zone (LOC-API-1)?
class Coverage {
  const Coverage({required this.covered, this.zoneName});

  final bool covered;
  final String? zoneName;
}

/// The location the app works with (from the first screen on), kept across restarts.
class SelectedLocation {
  const SelectedLocation({required this.point, required this.line, required this.covered});

  factory SelectedLocation.fromJson(Map<String, dynamic> j) => SelectedLocation(
    point: GeoPoint((j['lat'] as num).toDouble(), (j['lng'] as num).toDouble()),
    line: j['line'] as String? ?? '',
    covered: j['covered'] as bool? ?? true,
  );

  final GeoPoint point;
  final String line;

  /// Outside every zone: the app still browses, with pickup suggested instead of delivery.
  final bool covered;

  Map<String, Object> toJson() => {'lat': point.latitude, 'lng': point.longitude, 'line': line, 'covered': covered};
}

enum LocationAccess { granted, notAsked, denied, deniedForever, serviceOff }
