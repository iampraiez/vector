import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';

/// Singleton API service for all driver-facing endpoints.
/// Auto-injects the JWT access token on every request, and silently refreshes
/// on 401 (one retry) before propagating an error.
class DriverApiService {
  static final DriverApiService instance = DriverApiService._();
  DriverApiService._() {
    _dio.interceptors.add(_AuthInterceptor(_dio, _storage));
  }

  final _storage = const FlutterSecureStorage();
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
    ),
  );

  // ── Home ──────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getHomeSummary() async {
    try {
      final res = await _dio.get('/driver/home');
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ── Assignments ───────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getAssignments({String? date}) async {
    try {
      final res = await _dio.get(
        '/driver/assignments',
        queryParameters: date != null ? {'date': date} : null,
      );
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ── Routes ────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getRoutePreview(String routeId) async {
    try {
      final res = await _dio.get('/driver/routes/$routeId');
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> startRoute(String routeId) async {
    try {
      await _dio.post('/driver/routes/$routeId/start');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ── Stops ─────────────────────────────────────────────────────────────────

  Future<void> arriveAtStop(String stopId) async {
    try {
      await _dio.post('/driver/stops/$stopId/arrive');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> completeDelivery(
    String stopId, {
    String? photoUrl,
    String? qrCode,
    String? notes,
  }) async {
    try {
      await _dio.post(
        '/driver/stops/$stopId/complete',
        data: {
          if (photoUrl != null) 'photo_urls': [photoUrl],
          'qr_code': qrCode,
          if (notes != null && notes.isNotEmpty) 'notes': notes,
        },
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> failDelivery(
    String stopId, {
    required String reason,
    String? notes,
  }) async {
    try {
      await _dio.post(
        '/driver/stops/$stopId/fail',
        data: {
          'reason': reason,
          if (notes != null && notes.isNotEmpty) 'notes': notes,
        },
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ── History ───────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getHistory({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final res = await _dio.get(
        '/driver/history',
        queryParameters: {'page': page, 'limit': limit},
      );
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getProfile() async {
    try {
      final res = await _dio.get('/driver/profile');
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    try {
      final res = await _dio.patch('/driver/profile', data: data);
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getNotifications({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final res = await _dio.get(
        '/driver/notifications',
        queryParameters: {'page': page, 'limit': limit},
      );
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> markNotificationRead(String notificationId) async {
    try {
      await _dio.patch('/driver/notifications/$notificationId/read');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> markAllNotificationsRead() async {
    try {
      await _dio.post('/driver/notifications/read-all');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ── Driver status / location ──────────────────────────────────────────────

  Future<void> updateStatus(String status) async {
    try {
      await _dio.patch('/driver/status', data: {'status': status});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> updateLocation(double lat, double lng) async {
    try {
      await _dio.patch('/driver/location', data: {'lat': lat, 'lng': lng});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ── Settings OTP ──────────────────────────────────────────────────────────

  Future<void> requestSettingsOtp(String action) async {
    try {
      await _dio.post('/driver/settings/otp/request', data: {'action': action});
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> verifySettingsOtp(String action, String otp) async {
    try {
      await _dio.post(
        '/driver/settings/otp/verify',
        data: {'action': action, 'otp': otp},
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ── Error helper ──────────────────────────────────────────────────────────

  String _handleError(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Connection timed out. Check your internet and try again.';
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Unable to connect to the server. Please ensure you are online.';
    }
    if (e.response?.data != null) {
      final msg = (e.response!.data as Map<String, dynamic>?)?['message'];
      if (msg is List) return (msg).join(', ');
      if (msg is String) return msg;
    }
    return 'An unexpected error occurred. Please try again later.';
  }
}

// ── Dio interceptor: attach token + single-retry token refresh on 401 ────────

class _AuthInterceptor extends Interceptor {
  final Dio _dio;
  final FlutterSecureStorage _storage;
  bool _isRefreshing = false;

  _AuthInterceptor(this._dio, this._storage);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.read(key: 'access_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      try {
        final refreshToken = await _storage.read(key: 'refresh_token');
        if (refreshToken == null) {
          _isRefreshing = false;
          handler.next(err);
          return;
        }

        // Attempt token refresh using a clean Dio instance to avoid interceptor loops
        final refreshDio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));
        final res = await refreshDio.post(
          '/auth/refresh',
          data: {'refresh_token': refreshToken},
        );

        final newAccessToken = res.data['access_token'] as String?;
        final newRefreshToken = res.data['refresh_token'] as String?;

        if (newAccessToken != null) {
          await _storage.write(key: 'access_token', value: newAccessToken);
        }
        if (newRefreshToken != null) {
          await _storage.write(key: 'refresh_token', value: newRefreshToken);
        }

        // Retry original request with new token
        final retryOptions = err.requestOptions
          ..headers['Authorization'] = 'Bearer $newAccessToken';
        final retryResponse = await _dio.fetch(retryOptions);
        _isRefreshing = false;
        handler.resolve(retryResponse);
        return;
      } catch (e) {
        _isRefreshing = false;
        debugPrint('Token refresh failed: $e');
        // Clear stale tokens; router guard will redirect to login
        await _storage.delete(key: 'access_token');
        await _storage.delete(key: 'refresh_token');
      }
    }
    handler.next(err);
  }
}
