import 'package:dio/dio.dart';
import '../constants/api_constants.dart';

class AuthService {
  static final AuthService instance = AuthService._();
  AuthService._();

  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 10),
  ));

  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post('/auth/sign-in', data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> signUpDriver({
    required String email,
    required String password,
    required String name,
    required String phone,
    required String companyCode,
  }) async {
    try {
      final response = await _dio.post('/auth/sign-up/driver', data: {
        'email': email,
        'password': password,
        'full_name': name,
        'phone': phone,
        'company_code': companyCode,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> validateCompanyCode(String code) async {
    try {
      final response = await _dio.get('/auth/company/validate/$code');
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> verifyEmail(String email, String token) async {
    try {
      final response = await _dio.post('/auth/verify-email', data: {
        'email': email,
        'token': token,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> resendVerification(String email) async {
    try {
      final response = await _dio.post('/auth/resend-verification', data: {
        'email': email,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updateDriverProfile(
    String accessToken,
    Map<String, dynamic> profileData,
  ) async {
    try {
      final response = await _dio.patch(
        '/auth/driver/profile',
        data: profileData,
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> refresh(String refreshToken) async {
    try {
      final response = await _dio.post('/auth/refresh', data: {
        'refresh_token': refreshToken,
      });
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> signOut(String accessToken) async {
    try {
      await _dio.post(
        '/auth/sign-out',
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
    } catch (_) {
      // Ignore sign out errors
    }
  }

  Future<Map<String, dynamic>> completeOnboarding(String accessToken) async {
    try {
      final response = await _dio.post(
        '/auth/complete-onboarding',
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> joinCompany(
    String accessToken,
    String companyCode,
  ) async {
    try {
      final response = await _dio.post(
        '/auth/join-company',
        data: {'company_code': companyCode},
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Connection timed out. Please check your internet and try again.';
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Unable to connect to the server. Please ensure you are online.';
    }

    if (e.response?.data != null && e.response?.data['message'] != null) {
      final message = e.response?.data['message'];
      if (message is List) return message.join(', ');
      return message.toString();
    }
    return 'An unexpected error occurred. Please try again later.';
  }
}
