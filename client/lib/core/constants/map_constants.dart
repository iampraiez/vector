import 'package:flutter/foundation.dart';

class MapConstants {
  MapConstants._();

  /// OpenStreetMap tile URL template — completely free, no API key.
  static const String osmTileUrl =
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  /// Geoapify API key — read from dart-define (set in config.json).
  static const String geoapifyKey = String.fromEnvironment(
    'GEOAPIFY_API_KEY',
    defaultValue: '',
  );

  static bool get hasMapKey {
    if (geoapifyKey.isEmpty) {
      if (kDebugMode) {
        debugPrint(
          '[MapConstants] WARNING: GEOAPIFY_API_KEY is not set. '
          'Run with --dart-define-from-file=config.json',
        );
      }
      return false;
    }
    return true;
  }

  /// Geoapify Geocoding endpoint.
  static String geocodeUrl(String address) =>
      'https://api.geoapify.com/v1/geocode/search'
      '?text=${Uri.encodeComponent(address)}'
      '&format=json'
      '&apiKey=$geoapifyKey';

  /// Geoapify Routing endpoint.
  static const String routingUrl =
      'https://api.geoapify.com/v1/routing';
}
