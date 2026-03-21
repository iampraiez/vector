import 'dart:async';
import 'dart:io';
import 'package:geolocator/geolocator.dart';
import 'package:flutter/foundation.dart';

class LocationService {
  static final LocationService instance = LocationService._();
  LocationService._();

  /// Check if location services (GPS) are enabled on the device.
  Future<bool> isServiceEnabled() async {
    try {
      if (kIsWeb ||
          Platform.isAndroid ||
          Platform.isIOS ||
          Platform.isMacOS ||
          Platform.isWindows) {
        return await Geolocator.isLocationServiceEnabled();
      }
      return true; // Assume true for desktop/unsupported for mock testing
    } catch (_) {
      return true;
    }
  }

  /// Check the current permission status.
  Future<LocationPermission> checkPermission() async {
    try {
      if (kIsWeb ||
          Platform.isAndroid ||
          Platform.isIOS ||
          Platform.isMacOS ||
          Platform.isWindows) {
        return await Geolocator.checkPermission();
      }
      return LocationPermission.always;
    } catch (_) {
      return LocationPermission.always;
    }
  }

  /// Request location permissions from the user.
  Future<LocationPermission> requestPermission() async {
    return await Geolocator.requestPermission();
  }

  /// Open the app's location settings in the OS.
  Future<bool> openSettings() async {
    return await Geolocator.openAppSettings();
  }

  /// Open the device's location service settings (GPS toggle).
  Future<bool> openLocationSettings() async {
    return await Geolocator.openLocationSettings();
  }

  /// Get the current position of the device.
  Future<Position?> getCurrentPosition() async {
    try {
      if (!kIsWeb &&
          !Platform.isAndroid &&
          !Platform.isIOS &&
          !Platform.isMacOS &&
          !Platform.isWindows) {
        return _getMockPosition();
      }

      bool serviceEnabled = await isServiceEnabled();
      if (!serviceEnabled) return null;

      LocationPermission permission = await checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return null;
      }

      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      );
    } catch (e) {
      debugPrint('[LocationService] Error getting current position: $e');
      return _getMockPosition();
    }
  }

  /// Returns a stream of service status changes (enabled/disabled).
  Stream<ServiceStatus> getServiceStatusStream() {
    if (!kIsWeb &&
        !Platform.isAndroid &&
        !Platform.isIOS &&
        !Platform.isMacOS &&
        !Platform.isWindows) {
      return Stream.value(ServiceStatus.enabled).asBroadcastStream();
    }

    try {
      return Geolocator.getServiceStatusStream();
    } catch (e) {
      debugPrint('[LocationService] Service status stream error: $e');
      return Stream.value(ServiceStatus.enabled).asBroadcastStream();
    }
  }

  /// Returns a stream of position changes.
  Stream<Position> getPositionStream({
    int distanceFilter = 10,
    LocationAccuracy accuracy = LocationAccuracy.high,
  }) {
    if (!kIsWeb &&
        !Platform.isAndroid &&
        !Platform.isIOS &&
        !Platform.isMacOS &&
        !Platform.isWindows) {
      return Stream.periodic(
        const Duration(seconds: 10),
        (_) => _getMockPosition(),
      ).asBroadcastStream();
    }

    try {
      return Geolocator.getPositionStream(
        locationSettings: LocationSettings(
          accuracy: accuracy,
          distanceFilter: distanceFilter,
        ),
      );
    } catch (e) {
      debugPrint('[LocationService] Stream error: $e');
      return Stream.periodic(
        const Duration(seconds: 10),
        (_) => _getMockPosition(),
      ).asBroadcastStream();
    }
  }

  Position _getMockPosition() {
    return Position(
      latitude: 6.5244,
      longitude: 3.3792,
      timestamp: DateTime.now(),
      accuracy: 0.0,
      altitude: 0.0,
      altitudeAccuracy: 0.0,
      heading: 0.0,
      headingAccuracy: 0.0,
      speed: 0.0,
      speedAccuracy: 0.0,
    );
  }
}
