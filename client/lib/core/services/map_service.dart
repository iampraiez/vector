import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:latlong2/latlong.dart';
import '../constants/api_constants.dart';
import '../constants/map_constants.dart';

/// Typed result from the routing/directions endpoint.
class MapRouteData {
  final List<LatLng> polylinePoints;
  final double distanceKm;
  final int durationMin;

  const MapRouteData({
    required this.polylinePoints,
    required this.distanceKm,
    required this.durationMin,
  });
}

class MapService {
  static final MapService instance = MapService._();
  MapService._();

  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
  ));

  final Dio _geoapifyDio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
  ));

  // ── Geocoding ─────────────────────────────────────────────────────────────

  /// Converts a human-readable address to a [LatLng] coordinate.
  /// Returns null if geocoding fails or address is not found.
  Future<LatLng?> geocodeAddress(String address) async {
    if (!MapConstants.hasMapKey) return null;

    try {
      final url = MapConstants.geocodeUrl(address);
      final res = await _geoapifyDio.get(url);
      final results = res.data['results'] as List?;
      if (results == null || results.isEmpty) return null;
      final first = results.first as Map<String, dynamic>;
      final lat = (first['lat'] as num).toDouble();
      final lng = (first['lon'] as num).toDouble();
      return LatLng(lat, lng);
    } catch (e) {
      if (kDebugMode) debugPrint('[MapService] Geocode error: $e');
      return null;
    }
  }

  // ── Routing ───────────────────────────────────────────────────────────────

  /// Fetches a driving route between a list of [waypoints].
  /// Returns null if the request fails.
  Future<MapRouteData?> getDirections(List<LatLng> waypoints) async {
    if (!MapConstants.hasMapKey || waypoints.length < 2) return null;

    try {
      final waypointsParam = waypoints
          .map((p) => '${p.latitude},${p.longitude}')
          .join('|');

      final res = await _geoapifyDio.get(
        MapConstants.routingUrl,
        queryParameters: {
          'waypoints': waypointsParam,
          'mode': 'drive',
          'apiKey': MapConstants.geoapifyKey,
        },
      );

      final features = res.data['features'] as List?;
      if (features == null || features.isEmpty) return null;

      final feature = features.first as Map<String, dynamic>;
      final props = feature['properties'] as Map<String, dynamic>;
      final geometry = feature['geometry'] as Map<String, dynamic>;

      // Distance in metres → km
      final distanceKm =
          ((props['distance'] as num?)?.toDouble() ?? 0) / 1000;

      // Time in seconds → minutes
      final durationMin =
          (((props['time'] as num?)?.toDouble() ?? 0) / 60).round();

      // Decode LineString coordinates [lon, lat]
      final coords = geometry['coordinates'] as List;
      final points = coords
          .map((c) {
            final pair = c as List;
            return LatLng(
              (pair[1] as num).toDouble(),
              (pair[0] as num).toDouble(),
            );
          })
          .toList();

      return MapRouteData(
        polylinePoints: points,
        distanceKm: distanceKm,
        durationMin: durationMin,
      );
    } catch (e) {
      if (kDebugMode) debugPrint('[MapService] Directions error: $e');
      return null;
    }
  }

  // ── Driver Location ───────────────────────────────────────────────────────

  /// Sends the driver's current GPS position to the backend.
  Future<void> updateDriverLocation(double lat, double lng) async {
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'access_token');
      if (token == null) return;
      await _dio.put(
        '/driver/location',
        data: {'lat': lat, 'lng': lng},
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );
    } catch (e) {
      if (kDebugMode) debugPrint('[MapService] Location update error: $e');
    }
  }

  // ── Decode polyline (fallback for encoded strings) ────────────────────────

  /// Decodes a Google-encoded polyline string to a list of [LatLng].
  static List<LatLng> decodePolyline(String encoded) {
    final List<LatLng> points = [];
    int index = 0;
    int lat = 0;
    int lng = 0;

    while (index < encoded.length) {
      int shift = 0;
      int result = 0;
      int b;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1F) << shift;
        shift += 5;
      } while (b >= 0x20);
      final dLat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lat += dLat;

      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1F) << shift;
        shift += 5;
      } while (b >= 0x20);
      final dLng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lng += dLng;

      points.add(LatLng(lat / 1e5, lng / 1e5));
    }
    return points;
  }
}
