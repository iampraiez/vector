import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:geolocator/geolocator.dart';

import '../constants/api_constants.dart';

/// Entry point for the Android foreground service isolate (must be top-level).
@pragma('vm:entry-point')
void navigationForegroundTaskStartCallback() {
  FlutterForegroundTask.setTaskHandler(NavigationLocationTaskHandler());
}

/// Periodically reads GPS and PATCHes `/driver/status/location` while the
/// navigation screen keeps the foreground service alive (screen may be locked).
class NavigationLocationTaskHandler extends TaskHandler {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
    ),
  );

  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  @override
  Future<void> onStart(DateTime timestamp, TaskStarter starter) async {}

  @override
  void onRepeatEvent(DateTime timestamp) {
    unawaited(_syncLocation());
  }

  Future<void> _syncLocation() async {
    try {
      final token = await _storage.read(key: 'access_token');
      if (token == null || token.isEmpty) return;

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          distanceFilter: 0,
        ),
      );

      FlutterForegroundTask.sendDataToMain(<String, double>{
        'lat': pos.latitude,
        'lng': pos.longitude,
      });

      await _dio.patch(
        '/driver/status/location',
        data: {'lat': pos.latitude, 'lng': pos.longitude},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } catch (_) {
      // Next repeat will retry.
    }
  }

  @override
  Future<void> onDestroy(DateTime timestamp, bool isTimeout) async {}
}
