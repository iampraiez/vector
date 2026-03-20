import 'package:geolocator/geolocator.dart';
import 'package:flutter/material.dart';

class LocationService {
  static final LocationService instance = LocationService._();
  LocationService._();

  /// Check if location services (GPS) are enabled on the device.
  Future<bool> isServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  /// Check the current permission status.
  Future<LocationPermission> checkPermission() async {
    return await Geolocator.checkPermission();
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
      return null;
    }
  }

  /// Returns a stream of position changes.
  Stream<Position> getPositionStream({
    int distanceFilter = 10,
    LocationAccuracy accuracy = LocationAccuracy.high,
  }) {
    return Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: accuracy,
        distanceFilter: distanceFilter,
      ),
    );
  }
}
